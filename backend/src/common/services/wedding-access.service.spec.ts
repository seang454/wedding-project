import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WeddingAccessService } from './wedding-access.service';
import { UserRole } from '../../modules/users/entities/user.entity';

describe('WeddingAccessService', () => {
  const createMockDataSource = (overrides: {
    ownerWedding?: { id: string; ownerId: string } | null;
    clerkCount?: number;
  }) => {
    const qb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(overrides.clerkCount ?? 0),
    };
    const repo = {
      findOne: jest.fn().mockResolvedValue(overrides.ownerWedding ?? null),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };
    return {
      getRepository: jest.fn().mockReturnValue(repo),
    } as unknown as DataSource;
  };

  it('allows ADMIN without querying', async () => {
    const ds = createMockDataSource({});
    const service = new WeddingAccessService(ds);
    await expect(
      service.assertAccess('w-1', { id: 'u-1', role: UserRole.ADMIN }),
    ).resolves.toBeUndefined();
    expect(ds.getRepository).not.toHaveBeenCalled();
  });

  it('allows OWNER when ownerId matches', async () => {
    const ds = createMockDataSource({
      ownerWedding: { id: 'w-1', ownerId: 'u-1' },
    });
    const service = new WeddingAccessService(ds);
    await expect(
      service.assertAccess('w-1', { id: 'u-1', role: UserRole.OWNER }),
    ).resolves.toBeUndefined();
  });

  it('throws ForbiddenException when OWNER does not own wedding', async () => {
    const ds = createMockDataSource({
      ownerWedding: { id: 'w-1', ownerId: 'other-owner' },
    });
    const service = new WeddingAccessService(ds);
    await expect(
      service.assertAccess('w-1', { id: 'u-1', role: UserRole.OWNER }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws NotFoundException when wedding does not exist for OWNER', async () => {
    const ds = createMockDataSource({ ownerWedding: null });
    const service = new WeddingAccessService(ds);
    await expect(
      service.assertAccess('w-missing', { id: 'u-1', role: UserRole.OWNER }),
    ).rejects.toThrow(NotFoundException);
  });

  it('allows CLERK when assigned to wedding', async () => {
    const ds = createMockDataSource({ clerkCount: 1 });
    const service = new WeddingAccessService(ds);
    await expect(
      service.assertAccess('w-1', { id: 'c-1', role: UserRole.CLERK }),
    ).resolves.toBeUndefined();
  });

  it('throws ForbiddenException when CLERK is not assigned to wedding', async () => {
    const ds = createMockDataSource({ clerkCount: 0 });
    const service = new WeddingAccessService(ds);
    await expect(
      service.assertAccess('w-1', { id: 'c-1', role: UserRole.CLERK }),
    ).rejects.toThrow(ForbiddenException);
  });
});
