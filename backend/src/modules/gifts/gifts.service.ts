import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Gift, GiftCurrency, PaymentMethod } from './entities/gift.entity';
import { Guest, GuestSide, InvitationStatus } from '../guests/entities/guest.entity';
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
          side: dto.side || GuestSide.BOTH,
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
          if (dto.side) existingGuest.side = dto.side;
          if (dto.tableNumber) existingGuest.tableNumber = dto.tableNumber;
          if (dto.province) existingGuest.province = dto.province;
          if (dto.district) existingGuest.district = dto.district;
          if (dto.commune) existingGuest.commune = dto.commune;
          if (dto.village) existingGuest.village = dto.village;
          if (dto.guestNote) existingGuest.notes = dto.guestNote;
          await guestRepo.save(existingGuest);
        }
      }

      // Determine USD & KHR amounts (stored in a single row per envelope)
      let usdAmount = Number(dto.amountUSD) || 0;
      let khrAmount = Number(dto.amountKHR) || 0;

      if (usdAmount === 0 && khrAmount === 0 && dto.amount && Number(dto.amount) > 0) {
        if (dto.currency === GiftCurrency.KHR) {
          khrAmount = Number(dto.amount);
        } else {
          usdAmount = Number(dto.amount);
        }
      }

      if (usdAmount <= 0 && khrAmount <= 0) {
        throw new BadRequestException('At least one positive gift amount (USD or KHR) is required');
      }

      // Record single Gift row atomically
      const giftRepo = manager.getRepository(Gift);
      const newGift = giftRepo.create({
        weddingId: dto.weddingId,
        guestId: targetGuestId,
        guestNameSnapshot: dto.guestNameSnapshot,
        amountUSD: usdAmount,
        amountKHR: khrAmount,
        paymentMethod: dto.paymentMethod,
        bankAccountId: dto.bankAccountId,
        transactionRef: dto.transactionRef,
        receiptImageUrl: dto.receiptImageUrl,
        wishes: dto.wishes,
        recordedBy: clerkId,
      });

      return giftRepo.save(newGift);
    });
  }

  async findAll(queryDto: QueryGiftDto): Promise<PageDto<Gift>> {
    const qb = this.giftRepository
      .createQueryBuilder('gift')
      .leftJoinAndSelect('gift.guest', 'guest')
      .leftJoinAndSelect('gift.bankAccount', 'bankAccount')
      .leftJoinAndSelect('gift.recordedByUser', 'clerk')
      .where('gift.weddingId = :weddingId', { weddingId: queryDto.weddingId });

    if (queryDto.currency === GiftCurrency.USD) {
      qb.andWhere('gift.amountUSD > 0');
    } else if (queryDto.currency === GiftCurrency.KHR) {
      qb.andWhere('gift.amountKHR > 0');
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
    const raw = await this.giftRepository
      .createQueryBuilder('gift')
      .select('COUNT(gift.id)', 'totalEnvelopes')
      .addSelect('COALESCE(SUM(gift.amount_usd), 0)', 'totalUSD')
      .addSelect('COALESCE(SUM(gift.amount_khr), 0)', 'totalKHR')
      .addSelect(
        `COALESCE(SUM(CASE WHEN gift.payment_method = 'CASH' THEN gift.amount_usd ELSE 0 END), 0)`,
        'cashUSD',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN gift.payment_method = 'CASH' THEN gift.amount_khr ELSE 0 END), 0)`,
        'cashKHR',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN gift.payment_method != 'CASH' THEN gift.amount_usd ELSE 0 END), 0)`,
        'qrUSD',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN gift.payment_method != 'CASH' THEN gift.amount_khr ELSE 0 END), 0)`,
        'qrKHR',
      )
      .addSelect(
        `COUNT(CASE WHEN gift.payment_method = 'CASH' THEN 1 ELSE NULL END)`,
        'countCash',
      )
      .addSelect(
        `COUNT(CASE WHEN gift.payment_method != 'CASH' THEN 1 ELSE NULL END)`,
        'countQr',
      )
      .where('gift.weddingId = :weddingId', { weddingId })
      .getRawOne();

    const totalEnvelopes = parseInt(raw?.totalEnvelopes, 10) || 0;
    const countCash = parseInt(raw?.countCash, 10) || 0;
    const countQr = parseInt(raw?.countQr, 10) || 0;

    return [
      {
        weddingId,
        currency: GiftCurrency.USD,
        totalEnvelopes,
        totalAmount: parseFloat(raw?.totalUSD) || 0,
        totalCash: parseFloat(raw?.cashUSD) || 0,
        countCash,
        totalQr: parseFloat(raw?.qrUSD) || 0,
        countQr,
      },
      {
        weddingId,
        currency: GiftCurrency.KHR,
        totalEnvelopes: 0,
        totalAmount: parseFloat(raw?.totalKHR) || 0,
        totalCash: parseFloat(raw?.cashKHR) || 0,
        countCash,
        totalQr: parseFloat(raw?.qrKHR) || 0,
        countQr,
      },
    ];
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
        `SUM(CASE WHEN gift.payment_method = 'CASH' THEN gift.amount_usd ELSE 0 END)`,
        'cashUSD',
      )
      .addSelect(
        `SUM(CASE WHEN gift.payment_method = 'CASH' THEN gift.amount_khr ELSE 0 END)`,
        'cashKHR',
      )
      .addSelect(
        `SUM(CASE WHEN gift.payment_method != 'CASH' THEN gift.amount_usd ELSE 0 END)`,
        'qrUSD',
      )
      .addSelect(
        `SUM(CASE WHEN gift.payment_method != 'CASH' THEN gift.amount_khr ELSE 0 END)`,
        'qrKHR',
      )
      .addSelect(`SUM(gift.amount_usd)`, 'totalUSD')
      .addSelect(`SUM(gift.amount_khr)`, 'totalKHR')
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
      const usd = Number(gift.amountUSD) || 0;
      const khr = Number(gift.amountKHR) || 0;
      const isQr = gift.paymentMethod === 'QR_CODE' || gift.paymentMethod === 'BANK_TRANSFER';
      totalUSD += usd;
      totalKHR += khr;
      if (isQr) {
        qrUSD += usd;
        qrKHR += khr;
      } else {
        cashUSD += usd;
        cashKHR += khr;
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
    const { amount, currency, ...rest } = dto;
    Object.assign(gift, rest);
    if (dto.amountUSD !== undefined) gift.amountUSD = dto.amountUSD;
    if (dto.amountKHR !== undefined) gift.amountKHR = dto.amountKHR;
    if (amount !== undefined && dto.amountUSD === undefined && dto.amountKHR === undefined) {
      if (currency === GiftCurrency.KHR) {
        gift.amountKHR = amount;
        gift.amountUSD = 0;
      } else {
        gift.amountUSD = amount;
        gift.amountKHR = 0;
      }
    }
    return this.giftRepository.save(gift);
  }

  async remove(id: string): Promise<void> {
    const gift = await this.findById(id);
    const guestId = gift.guestId;
    await this.giftRepository.remove(gift);

    if (guestId) {
      const remainingCount = await this.giftRepository.count({
        where: { guestId },
      });
      if (remainingCount === 0) {
        await this.guestRepository.update(
          { id: guestId },
          { invitationStatus: InvitationStatus.INVITED },
        );
      }
    }
  }
}
