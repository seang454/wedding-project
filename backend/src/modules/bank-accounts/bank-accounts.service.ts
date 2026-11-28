import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async create(dto: CreateBankAccountDto): Promise<BankAccount> {
    if (dto.isPrimary) {
      await this.bankAccountRepository.update(
        { weddingId: dto.weddingId },
        { isPrimary: false },
      );
    }

    const account = this.bankAccountRepository.create(dto);
    return this.bankAccountRepository.save(account);
  }

  async findByWedding(weddingId: string): Promise<BankAccount[]> {
    return this.bankAccountRepository.find({
      where: { weddingId, isDeleted: false },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<BankAccount> {
    const account = await this.bankAccountRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!account) {
      throw new NotFoundException(`Bank account with ID "${id}" not found`);
    }
    return account;
  }

  async update(id: string, dto: UpdateBankAccountDto): Promise<BankAccount> {
    const account = await this.findById(id);

    if (dto.isPrimary) {
      await this.bankAccountRepository.update(
        { weddingId: account.weddingId },
        { isPrimary: false },
      );
    }

    Object.assign(account, dto);
    return this.bankAccountRepository.save(account);
  }

  async setPrimary(id: string): Promise<BankAccount> {
    const account = await this.findById(id);

    // Reset all bank accounts for this wedding
    await this.bankAccountRepository.update(
      { weddingId: account.weddingId },
      { isPrimary: false },
    );

    account.isPrimary = true;
    return this.bankAccountRepository.save(account);
  }

  async remove(id: string): Promise<void> {
    const account = await this.findById(id);
    account.isDeleted = true;
    await this.bankAccountRepository.save(account);
  }
}
