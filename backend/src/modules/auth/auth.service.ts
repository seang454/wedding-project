import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User, UserRole } from '../users/entities/user.entity';

export interface SessionResult {
  authResponse: AuthResponseDto;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private getRefreshSecret(): string {
    const explicitRefresh = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (explicitRefresh) return explicitRefresh;
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (jwtSecret) return `${jwtSecret}_refresh`;
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new Error('JWT_SECRET or JWT_REFRESH_SECRET must be set in production');
    }
    return 'super_secret_wedding_refresh_key_change_in_production_2026';
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private safeHashEquals(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

  async register(dto: RegisterDto): Promise<SessionResult> {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const newUser = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: UserRole.OWNER,
    });

    return this.issueSession(newUser);
  }

  async login(dto: LoginDto): Promise<SessionResult> {
    const user = await this.usersService.findByEmailOrPhone(dto.emailOrPhone);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueSession(user);
  }

  async refreshTokens(refreshToken: string): Promise<SessionResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: { sub?: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub?: string }>(refreshToken, {
        secret: this.getRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Session revoked or user no longer exists');
    }

    const incomingHash = this.hashRefreshToken(refreshToken);
    if (!this.safeHashEquals(incomingHash, user.refreshTokenHash)) {
      // Token reuse detected -> revoke session immediately
      await this.usersService.updateRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Refresh token invalid or reused');
    }

    return this.issueSession(user);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = await this.jwtService.verifyAsync<{ sub?: string }>(refreshToken, {
        secret: this.getRefreshSecret(),
      });
      if (payload?.sub) {
        await this.usersService.updateRefreshTokenHash(payload.sub, null);
      }
    } catch {
      // Ignore invalid/expired token on logout
    }
  }

  private async issueSession(user: User): Promise<SessionResult> {
    const payload = {
      sub: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, jti: randomUUID() },
      {
        secret: this.getRefreshSecret(),
        expiresIn: refreshExpiresIn as any,
      },
    );

    await this.usersService.updateRefreshTokenHash(
      user.id,
      this.hashRefreshToken(refreshToken),
    );

    return {
      refreshToken,
      authResponse: {
        accessToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    };
  }
}
