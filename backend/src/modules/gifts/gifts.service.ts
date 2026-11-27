import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Gift, GiftCurrency, PaymentMethod } from './entities/gift.entity';
import { Guest, InvitationStatus } from '../guests/entities/guest.entity';
import { RecordGiftDto } from './dto/record-gift.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { QueryGiftDto } from './dto/query-gift.dto';
import { GiftSummaryResponseDto } from './dto/gift-summary-response.dto';
import { ClerkReconciliationResponseDto } from './dto/clerk-reconciliation-response.dto';
import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { PageDto } from '../../common/dto/page.dto';

@Injectable()
export class GiftsService {
  constructor(
    @InjectRepository(Gift)
    private readonly giftRepository: Repository<Gift>,
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * ALL-IN-ONE Reception Gift Entry:
   * 1. If createGuestProfile is true or walk-in, creates Guest profile
   * 2. If guestId exists, updates guest info and marks as ATTENDED
   * 3. Records Gift with clerk ID tracking
   * All wrapped in an ACID transaction
   */
  async recordGift(dto: RecordGiftDto, clerkId?: string): Promise<Gift> {
    return this.dataSource.transaction(async (manager) => {
      let targetGuestId = dto.guestId;

      // Case A: Create new guest profile on the fly (Walk-in or explicit request)
      if (dto.createGuestProfile && !targetGuestId) {
        const guestRepo = manager.getRepository(Guest);
        const newGuest = guestRepo.create({
          weddingId: dto.weddingId,
          name: dto.guestNameSnapshot,
          phone: dto.phone,
          tableNumber: dto.tableNumber,
          province: dto.province,
          district: dto.district,
          commune: dto.commune,
          village: dto.village,
          notes: dto.guestNote,
          invitationStatus: InvitationStatus.ATTENDED,
        });
        const savedGuest = await guestRepo.save(newGuest);
        targetGuestId = savedGuest.id;
      }
      // Case B: Existing guest selected -> Update guest info and mark ATTENDED
      else if (targetGuestId) {
        const guestRepo = manager.getRepository(Guest);
        const existingGuest = await guestRepo.findOne({
          where: { id: targetGuestId },
        });

        if (existingGuest) {
          existingGuest.invitationStatus = InvitationStatus.ATTENDED;
          if (dto.phone) existingGuest.phone = dto.phone;
          if (dto.tableNumber) existingGuest.tableNumber = dto.tableNumber;
          if (dto.province) existingGuest.province = dto.province;
          if (dto.district) existingGuest.district = dto.district;
          if (dto.commune) existingGuest.commune = dto.commune;
          if (dto.village) existingGuest.village = dto.village;
          if (dto.guestNote) existingGuest.notes = dto.guestNote;
          await guestRepo.save(existingGuest);
        }
      }

      // Determine gift entries (supports USD-only, KHR-only, or BOTH USD & KHR in one submission)
      const entries: Array<{ amount: number; currency: GiftCurrency }> = [];
      const usdAmount = Number(dto.amountUSD) || 0;
      const khrAmount = Number(dto.amountKHR) || 0;

      if (usdAmount > 0 || khrAmount > 0) {
        if (usdAmount > 0) entries.push({ amount: usdAmount, currency: GiftCurrency.USD });
        if (khrAmount > 0) entries.push({ amount: khrAmount, currency: GiftCurrency.KHR });
      } else if (dto.amount && Number(dto.amount) > 0) {
        entries.push({
          amount: Number(dto.amount),
          currency: dto.currency || GiftCurrency.USD,
        });
      }

      if (entries.length === 0) {
        throw new BadRequestException('At least one positive gift amount (USD or KHR) is required');
      }

      // Record the Gift(s) atomically
      const giftRepo = manager.getRepository(Gift);
      const giftsToSave = entries.map((entry) =>
        giftRepo.create({
          weddingId: dto.weddingId,
          guestId: targetGuestId,
          guestNameSnapshot: dto.guestNameSnapshot,
          amount: entry.amount,
          currency: entry.currency,
          paymentMethod: dto.paymentMethod,
          bankAccountId: dto.bankAccountId,
          transactionRef: dto.transactionRef,
          receiptImageUrl: dto.receiptImageUrl,
          wishes: dto.wishes,
          recordedBy: clerkId,
        }),
      );

      const savedGifts = await giftRepo.save(giftsToSave);
      return savedGifts[0];
    });
  }

  async findAll(queryDto: QueryGiftDto): Promise<PageDto<Gift>> {
    const qb = this.giftRepository
      .createQueryBuilder('gift')
      .leftJoinAndSelect('gift.guest', 'guest')
      .leftJoinAndSelect('gift.bankAccount', 'bankAccount')
      .leftJoinAndSelect('gift.recordedByUser', 'clerk')
      .where('gift.weddingId = :weddingId', { weddingId: queryDto.weddingId });

    if (queryDto.currency) {
      qb.andWhere('gift.currency = :currency', { currency: queryDto.currency });
    }

    if (queryDto.paymentMethod) {
      qb.andWhere('gift.paymentMethod = :paymentMethod', {
        paymentMethod: queryDto.paymentMethod,
      });
    }

    const strippedSearch = queryDto.search?.replace(/\s+/g, '');
    if (strippedSearch && strippedSearch.length > 0) {
      qb.andWhere(
        "LOWER(REGEXP_REPLACE(gift.guestNameSnapshot, '\\s+', '', 'g')) LIKE LOWER(:search)",
        {
          search: `%${strippedSearch}%`,
        },
      );
    }

    const page = queryDto.page || 1;
    const take = queryDto.limit || 20;
    const skip = (page - 1) * take;

    qb.orderBy('gift.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    const [items, itemCount] = await qb.getManyAndCount();

    const pageOptionsDto: PageOptionsDto = {
      page,
      take,
      skip,
      order: undefined,
    };
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(items, pageMetaDto);
  }

  async getSummary(weddingId: string): Promise<GiftSummaryResponseDto[]> {
    const rawResults = await this.giftRepository
      .createQueryBuilder('gift')
      .select('gift.currency', 'currency')
      .addSelect('COUNT(gift.id)', 'totalEnvelopes')
      .addSelect('SUM(gift.amount)', 'totalAmount')
      .addSelect(
        `SUM(CASE WHEN gift.payment_method = 'CASH' THEN gift.amount ELSE 0 END)`,
        'totalCash',
      )
      .addSelect(
        `COUNT(CASE WHEN gift.payment_method = 'CASH' THEN 1 ELSE NULL END)`,
        'countCash',
      )
      .addSelect(
        `SUM(CASE WHEN gift.payment_method != 'CASH' THEN gift.amount ELSE 0 END)`,
        'totalQr',
      )
      .addSelect(
        `COUNT(CASE WHEN gift.payment_method != 'CASH' THEN 1 ELSE NULL END)`,
        'countQr',
      )
      .where('gift.weddingId = :weddingId', { weddingId })
      .groupBy('gift.currency')
      .getRawMany();

    return rawResults.map((r) => ({
      weddingId,
      currency: r.currency as GiftCurrency,
      totalEnvelopes: parseInt(r.totalEnvelopes, 10) || 0,
      totalAmount: parseFloat(r.totalAmount) || 0,
      totalCash: parseFloat(r.totalCash) || 0,
      countCash: parseInt(r.countCash, 10) || 0,
      totalQr: parseFloat(r.totalQr) || 0,
      countQr: parseInt(r.countQr, 10) || 0,
    }));
  }

  async getClerkReconciliation(
    weddingId: string,
  ): Promise<ClerkReconciliationResponseDto[]> {
    const rawResults = await this.giftRepository
      .createQueryBuilder('gift')
      .leftJoin('gift.recordedByUser', 'clerk')
      .select('gift.recordedBy', 'clerkId')
      .addSelect("COALESCE(clerk.fullName, 'Unassigned Clerk')", 'clerkName')
      .addSelect('COUNT(gift.id)', 'totalEnvelopes')
      .addSelect(
        `SUM(CASE WHEN gift.payment_method = 'CASH' AND gift.currency = 'USD' THEN gift.amount ELSE 0 END)`,
        'cashUSD',
      )
      .addSelect(
        `SUM(CASE WHEN gift.payment_method = 'CASH' AND gift.currency = 'KHR' THEN gift.amount ELSE 0 END)`,
        'cashKHR',
      )
      .addSelect(
        `SUM(CASE WHEN gift.payment_method != 'CASH' AND gift.currency = 'USD' THEN gift.amount ELSE 0 END)`,
        'qrUSD',
      )
      .addSelect(
        `SUM(CASE WHEN gift.payment_method != 'CASH' AND gift.currency = 'KHR' THEN gift.amount ELSE 0 END)`,
        'qrKHR',
      )
      .addSelect(
        `SUM(CASE WHEN gift.currency = 'USD' THEN gift.amount ELSE 0 END)`,
        'totalUSD',
      )
      .addSelect(
        `SUM(CASE WHEN gift.currency = 'KHR' THEN gift.amount ELSE 0 END)`,
        'totalKHR',
      )
      .where('gift.weddingId = :weddingId', { weddingId })
      .groupBy('gift.recordedBy')
      .addGroupBy('clerk.fullName')
      .getRawMany();

    return rawResults.map((r) => ({
      clerkId: r.clerkId,
      clerkName: r.clerkName,
      totalEnvelopes: parseInt(r.totalEnvelopes, 10) || 0,
      cashUSD: parseFloat(r.cashUSD) || 0,
      cashKHR: parseFloat(r.cashKHR) || 0,
      qrUSD: parseFloat(r.qrUSD) || 0,
      qrKHR: parseFloat(r.qrKHR) || 0,
      totalUSD: parseFloat(r.totalUSD) || 0,
      totalKHR: parseFloat(r.totalKHR) || 0,
    }));
  }

  async getClerkReconciliationDetail(weddingId: string, clerkId: string) {
    const isAll = clerkId === 'all';
    if (
      !isAll &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clerkId)
    ) {
      throw new NotFoundException(`Invalid clerkId "${clerkId}"`);
    }

    const gifts = await this.giftRepository.find({
      where: isAll ? { weddingId } : { weddingId, recordedBy: clerkId },
      relations: {
        guest: true,
        bankAccount: true,
        recordedByUser: true,
      },
      order: { createdAt: 'DESC' },
    });

    let cashUSD = 0;
    let cashKHR = 0;
    let qrUSD = 0;
    let qrKHR = 0;
    let totalUSD = 0;
    let totalKHR = 0;

    for (const gift of gifts) {
      const amount = Number(gift.amount) || 0;
      const isQr = gift.paymentMethod === 'QR_CODE' || gift.paymentMethod === 'BANK_TRANSFER';
      if (gift.currency === 'USD') {
        totalUSD += amount;
        if (isQr) qrUSD += amount;
        else cashUSD += amount;
      } else if (gift.currency === 'KHR') {
        totalKHR += amount;
        if (isQr) qrKHR += amount;
        else cashKHR += amount;
      }
    }

    const clerkName = isAll
      ? 'អ្នកកត់ត្រាទាំងអស់'
      : gifts[0]?.recordedByUser?.fullName || 'អ្នកកត់ត្រា';

    return {
      clerkId,
      clerkName,
      summary: {
        totalEnvelopes: gifts.length,
        cashUSD,
        cashKHR,
        qrUSD,
        qrKHR,
        totalUSD,
        totalKHR,
      },
      gifts,
    };
  }

  async findById(id: string): Promise<Gift> {
    const gift = await this.giftRepository.findOne({
      where: { id },
      relations: {
        guest: true,
        bankAccount: true,
        recordedByUser: true,
      },
    });

    if (!gift) {
      throw new NotFoundException(`Gift record with ID "${id}" not found`);
    }

    return gift;
  }

  async findAllForExport(weddingId: string): Promise<Gift[]> {
    return this.giftRepository.find({
      where: { weddingId },
      relations: {
        guest: true,
        bankAccount: true,
        recordedByUser: true,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateGiftDto): Promise<Gift> {
    const gift = await this.findById(id);
    Object.assign(gift, dto);
    return this.giftRepository.save(gift);
  }

  async remove(id: string): Promise<void> {
    const gift = await this.findById(id);
    await this.giftRepository.remove(gift);
  }
}
