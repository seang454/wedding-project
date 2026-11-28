import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Wedding } from '../../modules/weddings/entities/wedding.entity';
import { User, UserRole } from '../../modules/users/entities/user.entity';

@Injectable()
export class WeddingAccessService {
  constructor(private readonly dataSource: DataSource) {}

  async assertAccess(
    weddingId: string,
    user?: Pick<User, 'id' | 'role'>,
  ): Promise<void> {
    if (!user || user.role === UserRole.ADMIN) {
      return;
    }

    const weddingRepo = this.dataSource.getRepository(Wedding);

    if (user.role === UserRole.CLERK || user.role === UserRole.ACCOUNTANT) {
      const assigned = await weddingRepo
        .createQueryBuilder('wedding')
        .innerJoin('wedding.clerks', 'clerk', 'clerk.id = :userId AND clerk.isDeleted = false', {
          userId: user.id,
        })
        .where('wedding.id = :weddingId AND wedding.isDeleted = false', { weddingId })
        .getCount();

      if (assigned === 0) {
        throw new ForbiddenException('You are not assigned to this wedding');
      }
      return;
    }

    const wedding = await weddingRepo.findOne({
      where: { id: weddingId, isDeleted: false },
      select: { id: true, ownerId: true },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID "${weddingId}" not found`);
    }

    if (wedding.ownerId !== user.id) {
      throw new ForbiddenException('You do not have access to this wedding');
    }
  }
}
