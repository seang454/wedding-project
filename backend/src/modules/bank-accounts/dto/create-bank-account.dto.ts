import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Target wedding ID',
  })
  @IsUUID()
  @IsNotEmpty()
  weddingId: string;

  @ApiProperty({ example: 'ABA Bank (USD)', description: 'Bank and currency name' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: 'CHAN VANNA & MEAS LINDA' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ example: '001 234 567' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiPropertyOptional({
    example: 'https://r2.../aba_usd_qr.png',
    description: 'Cloudflare R2 link to QR code image',
  })
  @IsOptional()
  @IsString()
  qrImageUrl?: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
