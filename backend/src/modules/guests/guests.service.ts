import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest, InvitationStatus } from './entities/guest.entity';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { QueryGuestDto } from './dto/query-guest.dto';
import { BatchCreateGuestDto } from './dto/batch-create-guest.dto';
import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { PageDto } from '../../common/dto/page.dto';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
  ) {}

  async create(dto: CreateGuestDto): Promise<Guest> {
    const guest = this.guestRepository.create(dto);
    return this.guestRepository.save(guest);
  }

  async createBatch(
    weddingId: string,
    dto: BatchCreateGuestDto,
  ): Promise<{ insertedCount: number }> {
    const entities = dto.guests.map((g) =>
      this.guestRepository.create({
        ...g,
        weddingId,
      }),
    );

    // Save in chunks of 100 for high performance & safe memory consumption
    await this.guestRepository.save(entities, { chunk: 100 });

    return {
      insertedCount: entities.length,
    };
  }

  async findAllForExport(weddingId: string): Promise<Guest[]> {
    return this.guestRepository.find({
      where: { weddingId },
      order: { name: 'ASC' },
    });
  }

  async findAll(
    weddingId: string,
    pageOptionsDto: PageOptionsDto,
    filters?: {
      search?: string;
      side?: string;
      status?: string;
      tableNumber?: string;
    },
  ): Promise<PageDto<Guest>> {
    const queryBuilder = this.guestRepository.createQueryBuilder('guest');

    queryBuilder
      .leftJoinAndSelect('guest.gifts', 'gift')
      .where('guest.weddingId = :weddingId', { weddingId });

    const strippedSearch = filters?.search?.replace(/\s+/g, '');
    if (strippedSearch) {
      queryBuilder.andWhere(
        "(LOWER(REGEXP_REPLACE(guest.name, '\\s+', '', 'g')) LIKE LOWER(:search) OR REGEXP_REPLACE(COALESCE(guest.phone, ''), '\\s+', '', 'g') LIKE :search)",
        { search: `%${strippedSearch}%` },
      );
    }

    if (filters?.side) {
      queryBuilder.andWhere('guest.side = :side', { side: filters.side });
    }

    if (filters?.status) {
      queryBuilder.andWhere('guest.invitationStatus = :status', {
        status: filters.status,
      });
    }

    if (filters?.tableNumber) {
      const tableNum = parseInt(filters.tableNumber, 10);
      if (!isNaN(tableNum)) {
        queryBuilder.andWhere('guest.tableNumber = :tableNum', { tableNum });
      }
    }

    queryBuilder
      .orderBy('guest.createdAt', pageOptionsDto.order || 'DESC')
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(entities, pageMetaDto);
  }

  async search(queryDto: QueryGuestDto): Promise<Guest[]> {
    const qb = this.guestRepository
      .createQueryBuilder('guest')
      .leftJoin('guest.gifts', 'gift')
      .where('guest.weddingId = :weddingId', { weddingId: queryDto.weddingId })
      .andWhere('gift.id IS NULL');

    const strippedSearch = queryDto.search?.replace(/\s+/g, '');
    if (strippedSearch && strippedSearch.length > 0) {
      qb.andWhere(
        "(LOWER(REGEXP_REPLACE(guest.name, '\\s+', '', 'g')) LIKE LOWER(:search) OR REGEXP_REPLACE(COALESCE(guest.phone, ''), '\\s+', '', 'g') LIKE :search)",
        { search: `%${strippedSearch}%` },
      );
    }

    return qb
      .orderBy('guest.name', 'ASC')
      .take(queryDto.limit || 20)
      .getMany();
  }

  async findById(id: string): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: { id },
      relations: { gifts: true },
    });

    if (!guest) {
      throw new NotFoundException(`Guest with ID "${id}" not found`);
    }

    return guest;
  }

  async update(id: string, dto: UpdateGuestDto): Promise<Guest> {
    const guest = await this.findById(id);
    Object.assign(guest, dto);
    return this.guestRepository.save(guest);
  }

  async checkIn(id: string): Promise<Guest> {
    const guest = await this.findById(id);
    guest.invitationStatus = InvitationStatus.ATTENDED;
    return this.guestRepository.save(guest);
  }

  async remove(id: string): Promise<void> {
    const guest = await this.findById(id);
    await this.guestRepository.remove(guest);
  }
}
