import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadUrlRequestDto } from './dto/upload-url-request.dto';
import { UploadUrlResponseDto } from './dto/upload-url-response.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger('StorageService');
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private configService: ConfigService) {
    this.endpoint =
      this.configService.get<string>('S3_ENDPOINT') || 'http://localhost:9000';
    this.bucketName =
      this.configService.get<string>('S3_BUCKET_NAME') || 'wedding-receipts';

    this.s3Client = new S3Client({
      region: this.configService.get<string>('S3_REGION') || 'us-east-1',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId:
          this.configService.get<string>('S3_ACCESS_KEY') || 'minioadmin',
        secretAccessKey:
          this.configService.get<string>('S3_SECRET_KEY') ||
          'minioadminpassword',
      },
      forcePathStyle:
        this.configService.get<string>('S3_FORCE_PATH_STYLE') === 'true',
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  /**
   * Automatically ensure bucket exists and is publicly readable for images.
   */
  async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`Bucket "${this.bucketName}" already exists.`);
    } catch {
      try {
        this.logger.log(`Bucket "${this.bucketName}" not found. Creating automatically...`);
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        this.logger.log(`Bucket "${this.bucketName}" created successfully.`);

        // Apply public read policy so uploaded images can be displayed in browser
        const publicReadPolicy = {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadGetObject',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };

        await this.s3Client.send(
          new PutBucketPolicyCommand({
            Bucket: this.bucketName,
            Policy: JSON.stringify(publicReadPolicy),
          }),
        );
        this.logger.log(`Bucket "${this.bucketName}" policy set to Public Read successfully.`);
      } catch (err: unknown) {
        this.logger.warn(`Could not auto-create or set bucket policy: ${(err as Error)?.message}`);
      }
    }
  }

  async generatePresignedUploadUrl(
    dto: UploadUrlRequestDto,
  ): Promise<UploadUrlResponseDto> {
    // Ensure bucket is available before giving presigned URL
    await this.ensureBucketExists();

    const fileExtension = dto.fileName.split('.').pop() || 'jpg';
    const folder = dto.folder || 'slips';
    const uniqueKey = `${folder}/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: uniqueKey,
      ContentType: dto.contentType,
    });

    // URL is valid for 300 seconds (5 minutes)
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300,
    });

    const fileUrl = `${this.endpoint}/${this.bucketName}/${uniqueKey}`;

    return {
      uploadUrl,
      fileUrl,
      key: uniqueKey,
    };
  }
}
