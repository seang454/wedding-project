import { ApiProperty } from '@nestjs/swagger';
import { GiftCurrency } from '../entities/gift.entity';

export class GiftSummaryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  weddingId: string;

  @ApiProperty({ enum: GiftCurrency, example: GiftCurrency.USD })
  currency: GiftCurrency;

  @ApiProperty({ example: 450, description: 'Total envelopes/gifts received' })
  totalEnvelopes: number;

  @ApiProperty({ example: 12500.0, description: 'Total amount collected' })
  totalAmount: number;

  @ApiProperty({ example: 8500.0, description: 'Total cash amount' })
  totalCash: number;

  @ApiProperty({ example: 350, description: 'Total cash envelopes count' })
  countCash: number;

  @ApiProperty({ example: 4000.0, description: 'Total QR payments amount' })
  totalQr: number;

  @ApiProperty({ example: 100, description: 'Total QR payments count' })
  countQr: number;
}
