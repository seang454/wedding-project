import { ApiProperty } from '@nestjs/swagger';
import { PageOptionsDto } from './page-options.dto';

export interface PageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}

export class PageMetaDto {
  @ApiProperty({ example: 1 })
  readonly page: number;

  @ApiProperty({ example: 20 })
  readonly take: number;

  @ApiProperty({ example: 450, description: 'Total number of items in database' })
  readonly itemCount: number;

  @ApiProperty({ example: 23, description: 'Total number of pages' })
  readonly pageCount: number;

  @ApiProperty({ example: false })
  readonly hasPreviousPage: boolean;

  @ApiProperty({ example: true })
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page ?? 1;
    this.take = pageOptionsDto.take ?? 20;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
