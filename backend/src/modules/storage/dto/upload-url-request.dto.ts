import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadUrlRequestDto {
  @ApiProperty({
    example: 'receipt_slip.jpg',
    description: 'Original filename of the payment slip/image',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type of the file (image/jpeg, image/png)',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiPropertyOptional({
    example: 'slips',
    description: 'Target folder in bucket (default: slips)',
  })
  @IsOptional()
  @IsString()
  folder?: string = 'slips';
}
