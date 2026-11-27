import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GuestSide, InvitationStatus } from '../entities/guest.entity';

export class BatchGuestItemDto {
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
}

export class BatchCreateGuestDto {
  @ApiProperty({
    type: [BatchGuestItemDto],
    description: 'Array of guest items parsed from CSV/Excel (up to 2,000 items)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Must include at least 1 guest' })
  @ArrayMaxSize(2000, { message: 'Cannot import more than 2,000 guests in a single batch' })
  @Type(() => BatchGuestItemDto)
  guests: BatchGuestItemDto[];
}
