import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  IsEnum,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GiftCurrency, PaymentMethod } from '../entities/gift.entity';
import { GuestSide } from '../../guests/entities/guest.entity';

export class RecordGiftDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsNotEmpty()
  weddingId: string;

  @ApiProperty({
    example: 'Sok San',
    description: 'Name of the guest giving the envelope',
  })
  @IsString()
  @IsNotEmpty()
  guestNameSnapshot: string;

  @ApiPropertyOptional({ example: 50.0, description: 'Gift amount (when recording single currency)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ example: 50.0, description: 'USD amount (when recording USD or both USD & KHR)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountUSD?: number;

  @ApiPropertyOptional({ example: 100000, description: 'KHR amount (when recording KHR or both USD & KHR)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountKHR?: number;

  @ApiPropertyOptional({ enum: GiftCurrency, default: GiftCurrency.USD })
  @IsOptional()
  @IsEnum(GiftCurrency)
  currency?: GiftCurrency = GiftCurrency.USD;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  // Optional link if selected from existing guest search
  @ApiPropertyOptional({
    example: 'c1d2e3f4-a5b6-7890-abcd-ef1234567890',
    description: 'Optional ID of pre-existing guest',
  })
  @IsOptional()
  @IsUUID()
  guestId?: string;

  // Optional link if paid by couple's QR code
  @ApiPropertyOptional({
    example: 'b1c2d3e4-f5a6-7890-abcd-ef1234567890',
    description: 'Optional ID of couple bank account that received QR payment',
  })
  @IsOptional()
  @IsUUID()
  bankAccountId?: string;

  @ApiPropertyOptional({ example: 'TRX-19283724' })
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiPropertyOptional({
    example: 'https://r2.../slips/slip_105.jpg',
    description: 'Cloudflare R2 payment slip / receipt image URL',
  })
  @IsOptional()
  @IsString()
  receiptImageUrl?: string;

  @ApiPropertyOptional({ example: 'Happy Wedding! Wishing you eternal happiness!' })
  @IsOptional()
  @IsString()
  wishes?: string;

  // --- ALL-IN-ONE FORM EXTENSION FIELDS ---
  // (Used when clerk adds/updates guest details or registers walk-in on the spot)
  @ApiPropertyOptional({
    example: true,
    description: 'If true, automatically creates new guest record in guests table',
  })
  @IsOptional()
  @IsBoolean()
  createGuestProfile?: boolean;

  @ApiPropertyOptional({ example: '012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: GuestSide, default: GuestSide.BOTH })
  @IsOptional()
  @IsEnum(GuestSide)
  side?: GuestSide;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  tableNumber?: number;

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
  guestNote?: string;
}
