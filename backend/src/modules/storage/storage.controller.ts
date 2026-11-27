import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { UploadUrlRequestDto } from './dto/upload-url-request.dto';
import { UploadUrlResponseDto } from './dto/upload-url-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Storage & Receipts')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Generate a 1-minute secure presigned upload URL for direct S3 / Cloudflare R2 upload',
  })
  @ApiResponse({
    status: 201,
    description: 'Presigned upload URL created',
    type: UploadUrlResponseDto,
  })
  async getPresignedUrl(
    @Body() dto: UploadUrlRequestDto,
  ): Promise<UploadUrlResponseDto> {
    return this.storageService.generatePresignedUploadUrl(dto);
  }
}
