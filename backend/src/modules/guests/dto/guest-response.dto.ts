import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GuestSide, InvitationStatus } from '../entities/guest.entity';

export class GuestResponseDto {
  @ApiProperty({ example: 'c1d2e3f4-a5b6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  weddingId: string;

  @ApiProperty({ example: 'Sok San' })
  name: string;

  @ApiPropertyOptional({ example: '012345678' })
  phone?: string;

  @ApiProperty({ enum: GuestSide, example: GuestSide.BOTH })
  side: GuestSide;

  @ApiPropertyOptional({ example: 'High School Friend' })
  relationship?: string;

  @ApiPropertyOptional({ example: 12 })
  tableNumber?: number;

  @ApiProperty({ enum: InvitationStatus, example: InvitationStatus.INVITED })
  invitationStatus: InvitationStatus;

  @ApiPropertyOptional({ example: 'Phnom Penh' })
  province?: string;

  @ApiPropertyOptional({ example: 'Chamkar Mon' })
  district?: string;

  @ApiPropertyOptional({ example: 'Tonle Basak' })
  commune?: string;

  @ApiPropertyOptional({ example: 'Phum 1' })
  village?: string;

  @ApiProperty()
  createdAt: Date;
}
