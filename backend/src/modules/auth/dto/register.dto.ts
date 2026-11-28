import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Chan Vanna', description: 'Full name of user' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: 'vanna@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Password123!', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
