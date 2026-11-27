import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWeddingDto {
  @ApiProperty({ example: 'Chan Vanna', description: 'Groom full name' })
  @IsString()
  @IsNotEmpty()
  groomName: string;

  @ApiProperty({ example: 'Meas Linda', description: 'Bride full name' })
  @IsString()
  @IsNotEmpty()
  brideName: string;

  @ApiProperty({ example: '2026-12-12', description: 'Wedding date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  weddingDate: string;

  @ApiPropertyOptional({ example: 'The Premier Center Sen Sok' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({ example: 'ភ្នំពេញ' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'សែនសុខ' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'ភ្នំពេញថ្មី' })
  @IsOptional()
  @IsString()
  commune?: string;

  @ApiPropertyOptional({ example: '012 345 678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Wedding reception notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 10000.0, description: 'Optional target budget/goal' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  targetAmount?: number;

  @ApiPropertyOptional({
    example: 'https://minio.../weddings/cover.jpg',
    description: 'Optional wedding cover image URL',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
