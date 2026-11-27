import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Chan Vanna' })
  fullName: string;

  @ApiPropertyOptional({ example: 'vanna@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '012345678' })
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CLERK })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;
}
