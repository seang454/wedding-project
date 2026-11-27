import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClerkReconciliationResponseDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  clerkId: string;

  @ApiProperty({ example: 'Sok Mesa (Clerk 1)' })
  clerkName: string;

  @ApiProperty({ example: 85, description: 'Total envelopes received by this clerk' })
  totalEnvelopes: number;

  @ApiProperty({ example: 4250.0, description: 'Physical cash collected in USD' })
  cashUSD: number;

  @ApiProperty({ example: 3500000, description: 'Physical cash collected in KHR' })
  cashKHR: number;

  @ApiProperty({ example: 1200.0, description: 'QR payments received in USD' })
  qrUSD: number;

  @ApiProperty({ example: 800000, description: 'QR payments received in KHR' })
  qrKHR: number;

  @ApiProperty({ example: 5450.0, description: 'Total USD collected (Cash + QR)' })
  totalUSD: number;

  @ApiProperty({ example: 4300000, description: 'Total KHR collected (Cash + QR)' })
  totalKHR: number;
}
