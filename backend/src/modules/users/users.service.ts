import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Wedding } from '../weddings/entities/wedding.entity';
import { CreateClerkDto, UpdateClerkDto } from './dto/create-clerk.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Wedding)
    private weddingsRepository: Repository<Wedding>,
  ) {}

  async updateRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.usersRepository.update({ id: userId }, { refreshTokenHash });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id, isDeleted: false } });
  }

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [
        { email: identifier, isDeleted: false },
        { phone: identifier, isDeleted: false },
      ],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findClerks(ownerId?: string, isAdmin = false) {
    const qb = this.usersRepository
      .createQueryBuilder('clerk')
      .leftJoinAndSelect(
        'clerk.assignedWeddings',
        'wedding',
        'wedding.isDeleted = false',
      )
      .where('clerk.role = :role', { role: UserRole.CLERK })
      .andWhere('clerk.isDeleted = false');

    if (!isAdmin && ownerId) {
      qb.andWhere('clerk.createdByOwnerId = :ownerId', { ownerId });
    }

    const clerks = await qb.orderBy('clerk.createdAt', 'DESC').getMany();
    return clerks.map(({ passwordHash: _pw, refreshTokenHash: _rt, ...rest }) => rest);
  }

  async createClerk(dto: CreateClerkDto, ownerId: string) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let assignedWeddings: Wedding[] = [];
    if (dto.weddingIds && dto.weddingIds.length > 0) {
      assignedWeddings = await this.weddingsRepository.find({
        where: { id: In(dto.weddingIds), ownerId },
      });
    }

    const clerk = await this.create({
      fullName: dto.fullName,
      email: dto.email || undefined,
      phone: dto.phone || undefined,
      passwordHash,
      role: UserRole.CLERK,
      createdByOwnerId: ownerId,
      assignedWeddings,
    });

    const { passwordHash: _pw, refreshTokenHash: _rt, ...safeClerk } = clerk;
    return safeClerk;
  }

  async assignClerkWeddings(
    clerkId: string,
    weddingIds: string[],
    ownerId: string,
    isAdmin = false,
  ) {
    const clerk = await this.usersRepository.findOne({
      where: { id: clerkId, role: UserRole.CLERK },
      relations: { assignedWeddings: true },
    });
    if (!clerk) {
      throw new NotFoundException(`Clerk with ID "${clerkId}" not found`);
    }
    if (!isAdmin && clerk.createdByOwnerId !== ownerId) {
      throw new ForbiddenException('You do not have permission to manage this clerk');
    }

    const weddings =
      weddingIds.length > 0
        ? await this.weddingsRepository.find({
            where: isAdmin ? { id: In(weddingIds) } : { id: In(weddingIds), ownerId },
          })
        : [];

    clerk.assignedWeddings = weddings;
    const saved = await this.usersRepository.save(clerk);
    const { passwordHash: _pw, refreshTokenHash: _rt, ...safeClerk } = saved;
    return safeClerk;
  }

  async updateClerk(
    clerkId: string,
    dto: UpdateClerkDto,
    ownerId: string,
    isAdmin = false,
  ) {
    const clerk = await this.usersRepository.findOne({
      where: { id: clerkId, role: UserRole.CLERK },
      relations: { assignedWeddings: true },
    });
    if (!clerk) {
      throw new NotFoundException(`Clerk with ID "${clerkId}" not found`);
    }
    if (!isAdmin && clerk.createdByOwnerId !== ownerId) {
      throw new ForbiddenException('You do not have permission to edit this clerk');
    }

    if (dto.email !== undefined && dto.email !== clerk.email) {
      if (dto.email) {
        const existingEmail = await this.usersRepository.findOne({ where: { email: dto.email } });
        if (existingEmail && existingEmail.id !== clerk.id) {
          throw new ConflictException('Email is already registered');
        }
      }
      clerk.email = dto.email || (null as unknown as string);
    }

    if (dto.phone !== undefined && dto.phone !== clerk.phone) {
      if (dto.phone) {
        const existingPhone = await this.usersRepository.findOne({ where: { phone: dto.phone } });
        if (existingPhone && existingPhone.id !== clerk.id) {
          throw new ConflictException('Phone number is already registered');
        }
      }
      clerk.phone = dto.phone || (null as unknown as string);
    }

    if (dto.fullName !== undefined && dto.fullName.trim()) {
      clerk.fullName = dto.fullName.trim();
    }

    if (dto.password && dto.password.trim().length >= 6) {
      clerk.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.weddingIds !== undefined) {
      clerk.assignedWeddings =
        dto.weddingIds.length > 0
          ? await this.weddingsRepository.find({
              where: isAdmin ? { id: In(dto.weddingIds) } : { id: In(dto.weddingIds), ownerId },
            })
          : [];
    }

    const saved = await this.usersRepository.save(clerk);
    const { passwordHash: _pw, refreshTokenHash: _rt, ...safeClerk } = saved;
    return safeClerk;
  }

  async removeClerk(clerkId: string, ownerId: string, isAdmin = false): Promise<void> {
    const clerk = await this.usersRepository.findOne({
      where: { id: clerkId, role: UserRole.CLERK, isDeleted: false },
    });
    if (!clerk) {
      throw new NotFoundException(`Clerk with ID "${clerkId}" not found`);
    }
    if (!isAdmin && clerk.createdByOwnerId !== ownerId) {
      throw new ForbiddenException('You do not have permission to delete this clerk');
    }
    clerk.isDeleted = true;
    await this.usersRepository.save(clerk);
  }

  async create(userData: Partial<User>): Promise<User> {
    if (userData.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: userData.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email is already registered');
      }
    }

    if (userData.phone) {
      const existingPhone = await this.usersRepository.findOne({
        where: { phone: userData.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number is already registered');
      }
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }
}
