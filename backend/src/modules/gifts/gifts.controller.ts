import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GiftsService } from './gifts.service';
import { WeddingAccessService } from '../../common/services/wedding-access.service';
import { RecordGiftDto } from './dto/record-gift.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { QueryGiftDto } from './dto/query-gift.dto';
import { GiftResponseDto } from './dto/gift-response.dto';
import { GiftSummaryResponseDto } from './dto/gift-summary-response.dto';
import { ClerkReconciliationResponseDto } from './dto/clerk-reconciliation-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Gifts & Registration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gifts')
export class GiftsController {
  constructor(
    private readonly giftsService: GiftsService,
    private readonly weddingAccessService: WeddingAccessService,
  ) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN)
  @ApiOperation({
    summary: 'All-in-One Receptionist gift registration (Cash/QR envelope & guest check-in)',
  })
  @ApiResponse({
    status: 201,
    description: 'Gift recorded successfully',
    type: GiftResponseDto,
  })
  async recordGift(
    @Body() recordGiftDto: RecordGiftDto,
    @CurrentUser() user: User,
  ) {
    await this.weddingAccessService.assertAccess(recordGiftDto.weddingId, user);
    return this.giftsService.recordGift(recordGiftDto, user.id);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get paginated list of gifts with filters' })
  @ApiResponse({
    status: 200,
    description: 'Paginated gift logs',
  })
  async findAll(@Query() queryDto: QueryGiftDto, @CurrentUser() user: User) {
    await this.weddingAccessService.assertAccess(queryDto.weddingId, user);
    return this.giftsService.findAll(queryDto);
  }

  @Get('summary/:weddingId')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Real-time financial summary (Cash vs QR separated by USD & KHR)',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial totals by currency',
    type: [GiftSummaryResponseDto],
  })
  async getSummary(
    @Param('weddingId', ParseUUIDPipe) weddingId: string,
    @CurrentUser() user: User,
  ) {
    await this.weddingAccessService.assertAccess(weddingId, user);
    return this.giftsService.getSummary(weddingId);
  }

  @Get('reconciliation/:weddingId/clerk/:clerkId')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Detailed reconciliation for a specific clerk (list of attended guests/gifts and totals)',
  })
  @ApiResponse({
    status: 200,
    description: 'Clerk detailed gift list and financial breakdown',
  })
  async getClerkReconciliationDetail(
    @Param('weddingId', ParseUUIDPipe) weddingId: string,
    @Param('clerkId') clerkId: string,
    @CurrentUser() user: User,
  ) {
    await this.weddingAccessService.assertAccess(weddingId, user);
    return this.giftsService.getClerkReconciliationDetail(weddingId, clerkId);
  }

  @Get('reconciliation/:weddingId')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Clerk cash drawer reconciliation (balances physical cash collected per clerk)',
  })
  @ApiResponse({
    status: 200,
    description: 'Breakdown of physical cash and QR payments collected by each clerk',
    type: [ClerkReconciliationResponseDto],
  })
  async getClerkReconciliation(
    @Param('weddingId', ParseUUIDPipe) weddingId: string,
    @CurrentUser() user: User,
  ) {
    await this.weddingAccessService.assertAccess(weddingId, user);
    return this.giftsService.getClerkReconciliation(weddingId);
  }

  @Get('wedding/:weddingId/export')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Get all gifts for a wedding without pagination (for CSV and PDF report export)',
  })
  @ApiResponse({
    status: 200,
    description: 'Complete unpaginated gift list for export',
    type: [GiftResponseDto],
  })
  async findAllForExport(
    @Param('weddingId', ParseUUIDPipe) weddingId: string,
    @CurrentUser() user: User,
  ) {
    await this.weddingAccessService.assertAccess(weddingId, user);
    return this.giftsService.findAllForExport(weddingId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a recorded gift (amount, currency, payment method, wishes)' })
  @ApiResponse({
    status: 200,
    description: 'Gift updated successfully',
    type: GiftResponseDto,
  })
  async updateGift(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGiftDto: UpdateGiftDto,
    @CurrentUser() user: User,
  ) {
    const gift = await this.giftsService.findById(id);
    await this.weddingAccessService.assertAccess(gift.weddingId, user);
    return this.giftsService.update(id, updateGiftDto);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get details of a specific gift' })
  @ApiResponse({
    status: 200,
    description: 'Gift details',
    type: GiftResponseDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const gift = await this.giftsService.findById(id);
    await this.weddingAccessService.assertAccess(gift.weddingId, user);
    return gift;
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a gift record' })
  @ApiResponse({ status: 200, description: 'Gift record removed' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const gift = await this.giftsService.findById(id);
    await this.weddingAccessService.assertAccess(gift.weddingId, user);
    return this.giftsService.remove(id);
  }
}
