import { ApiProperty } from '@nestjs/swagger';

export class UploadUrlResponseDto {
  @ApiProperty({
    example:
      'https://r2.cloudflarestorage.com/bucket/slips/uuid.jpg?X-Amz-Signature=...',
    description: '1-minute secure presigned upload URL for direct client upload',
  })
  uploadUrl: string;

  @ApiProperty({
    example: 'https://r2.cloudflarestorage.com/bucket/slips/uuid.jpg',
    description: 'Permanent public URL of the uploaded image to save in PostgreSQL',
  })
  fileUrl: string;

  @ApiProperty({
    example: 'slips/uuid.jpg',
    description: 'Storage key inside the S3 bucket',
  })
  key: string;
}
