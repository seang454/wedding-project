import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GiftCurrency, PaymentMethod } from '../entities/gift.entity';

export class GiftResponseDto {
  @ApiProperty({ example: 'd1e2f3a4-b5c6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  weddingId: string;

  @ApiPropertyOptional({ example: 'c1d2e3f4-a5b6-7890-abcd-ef1234567890' })
  guestId?: string;

  @ApiProperty({ example: 'Sok San' })
  guestNameSnapshot: string;

  @ApiProperty({ example: 50.0 })
  amount: number;

  @ApiProperty({ enum: GiftCurrency, example: GiftCurrency.USD })
  currency: GiftCurrency;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'b1c2d3e4-f5a6-7890-abcd-ef1234567890' })
  bankAccountId?: string;

  @ApiPropertyOptional({ example: 'TRX-19283724' })
  transactionRef?: string;

  @ApiPropertyOptional({ example: 'https://r2.../slips/slip_105.jpg' })
  receiptImageUrl?: string;

  @ApiPropertyOptional({ example: 'Happy Wedding!' })
  wishes?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  recordedBy?: string;

  @ApiProperty()
  createdAt: Date;
}
