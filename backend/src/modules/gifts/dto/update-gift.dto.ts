import { IsString, IsOptional, IsNumber, Min, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GiftCurrency, PaymentMethod } from '../entities/gift.entity';

export class UpdateGiftDto {
  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ enum: GiftCurrency })
  @IsOptional()
  @IsEnum(GiftCurrency)
  currency?: GiftCurrency;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'Sok San' })
  @IsOptional()
  @IsString()
  guestNameSnapshot?: string;

  @ApiPropertyOptional({ example: 'Happy Wedding!' })
  @IsOptional()
  @IsString()
  wishes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  bankAccountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptImageUrl?: string;
}
