import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WeddingResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  ownerId: string;

  @ApiProperty({ example: 'Chan Vanna' })
  groomName: string;

  @ApiProperty({ example: 'Meas Linda' })
  brideName: string;

  @ApiProperty({ example: '2026-12-12' })
  weddingDate: Date;

  @ApiPropertyOptional({ example: 'The Premier Center Sen Sok' })
  venue?: string;

  @ApiPropertyOptional({ example: 10000.0 })
  targetAmount?: number;

  @ApiProperty()
  createdAt: Date;
}
