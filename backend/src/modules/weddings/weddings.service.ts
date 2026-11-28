import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wedding } from './entities/wedding.entity';
import { Gift } from '../gifts/entities/gift.entity';
import { Guest } from '../guests/entities/guest.entity';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';

@Injectable()
export class WeddingsService {
  constructor(
    @InjectRepository(Wedding)
    private readonly weddingRepository: Repository<Wedding>,
  ) {}

  async create(dto: CreateWeddingDto, ownerId: string): Promise<Wedding> {
    const wedding = this.weddingRepository.create({
      ...dto,
      weddingDate: new Date(dto.weddingDate),
      ownerId,
    });
    return this.weddingRepository.save(wedding);
  }

  async findAllByOwner(ownerId: string): Promise<Wedding[]> {
    return this.weddingRepository
      .createQueryBuilder('wedding')
      .leftJoinAndSelect(
        'wedding.bankAccounts',
        'bankAccounts',
        'bankAccounts.isDeleted = false',
      )
      .where('wedding.ownerId = :ownerId', { ownerId })
      .andWhere('wedding.isDeleted = false')
      .orderBy('wedding.weddingDate', 'DESC')
      .getMany();
  }

  async findAllAssignedToClerk(clerkId: string): Promise<Wedding[]> {
    return this.weddingRepository
      .createQueryBuilder('wedding')
      .innerJoin(
        'wedding.clerks',
        'clerk',
        'clerk.id = :clerkId AND clerk.isDeleted = false',
        { clerkId },
      )
      .leftJoinAndSelect(
        'wedding.bankAccounts',
        'bankAccounts',
        'bankAccounts.isDeleted = false',
      )
      .where('wedding.isDeleted = false')
      .orderBy('wedding.weddingDate', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<Wedding> {
    const wedding = await this.weddingRepository
      .createQueryBuilder('wedding')
      .leftJoinAndSelect(
        'wedding.bankAccounts',
        'bankAccounts',
        'bankAccounts.isDeleted = false',
      )
      .where('wedding.id = :id', { id })
      .andWhere('wedding.isDeleted = false')
      .getOne();

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID "${id}" not found`);
    }

    return wedding;
  }

  async findByIdForClerk(id: string, clerkId: string): Promise<Wedding> {
    const wedding = await this.weddingRepository
      .createQueryBuilder('wedding')
      .innerJoin(
        'wedding.clerks',
        'clerk',
        'clerk.id = :clerkId AND clerk.isDeleted = false',
        { clerkId },
      )
      .leftJoinAndSelect(
        'wedding.bankAccounts',
        'bankAccounts',
        'bankAccounts.isDeleted = false',
      )
      .where('wedding.id = :id', { id })
      .andWhere('wedding.isDeleted = false')
      .getOne();

    if (!wedding) {
      throw new ForbiddenException('You are not assigned to this wedding');
    }

    return wedding;
  }

  async update(
    id: string,
    dto: UpdateWeddingDto,
    ownerId: string,
    isAdmin = false,
  ): Promise<Wedding> {
    const wedding = await this.findById(id);

    if (!isAdmin && wedding.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have permission to modify this wedding');
    }

    const { weddingDate, ...rest } = dto;
    const updatedData: Partial<Wedding> = { ...rest };
    if (weddingDate) {
      updatedData.weddingDate = new Date(weddingDate);
    }

    Object.assign(wedding, updatedData);
    return this.weddingRepository.save(wedding);
  }

  async remove(id: string, ownerId: string, isAdmin = false): Promise<void> {
    const wedding = await this.findById(id);

    if (!isAdmin && wedding.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have permission to delete this wedding');
    }

    await this.weddingRepository.manager.transaction(async (manager) => {
      await manager.update(Gift, { weddingId: id, isDeleted: false }, { isDeleted: true });
      await manager.update(Guest, { weddingId: id, isDeleted: false }, { isDeleted: true });
      await manager.update(BankAccount, { weddingId: id, isDeleted: false }, { isDeleted: true });
      await manager.update(Wedding, { id }, { isDeleted: true });
    });
  }
}
