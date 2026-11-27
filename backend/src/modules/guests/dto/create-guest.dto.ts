import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GuestSide, InvitationStatus } from '../entities/guest.entity';

export class CreateGuestDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsNotEmpty()
  weddingId: string;

  @ApiProperty({ example: 'Sok San', description: 'Guest full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: GuestSide, default: GuestSide.BOTH })
  @IsOptional()
  @IsEnum(GuestSide)
  side?: GuestSide;

  @ApiPropertyOptional({ example: 'High School Friend' })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional({ example: 12, description: 'Table number' })
  @IsOptional()
  @IsInt()
  tableNumber?: number;

  @ApiPropertyOptional({ enum: InvitationStatus, default: InvitationStatus.INVITED })
  @IsOptional()
  @IsEnum(InvitationStatus)
  invitationStatus?: InvitationStatus;

  // Cambodia Address fields
  @ApiPropertyOptional({ example: 'Phnom Penh' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'Chamkar Mon' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'Tonle Basak' })
  @IsOptional()
  @IsString()
  commune?: string;

  @ApiPropertyOptional({ example: 'Phum 1' })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional({ example: 'University friend of the groom' })
  @IsOptional()
  @IsString()
  notes?: string;
}
