import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BankAccountResponseDto {
  @ApiProperty({ example: 'b1c2d3e4-f5a6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  weddingId: string;

  @ApiProperty({ example: 'ABA Bank (USD)' })
  bankName: string;

  @ApiProperty({ example: 'CHAN VANNA & MEAS LINDA' })
  accountName: string;

  @ApiProperty({ example: '001 234 567' })
  accountNumber: string;

  @ApiPropertyOptional({ example: 'https://r2.../aba_usd_qr.png' })
  qrImageUrl?: string;

  @ApiProperty({ example: true })
  isPrimary: boolean;

  @ApiProperty()
  createdAt: Date;
}
