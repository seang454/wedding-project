import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountResponseDto } from './dto/bank-account-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { WeddingAccessService } from '../../common/services/wedding-access.service';

@ApiTags('Bank Accounts & QR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(
    private readonly bankAccountsService: BankAccountsService,
    private readonly weddingAccessService: WeddingAccessService,
  ) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a receiving bank account (ABA, ACLEDA) with QR code' })
  @ApiResponse({
    status: 201,
    description: 'Bank account added successfully',
    type: BankAccountResponseDto,
  })
  async create(@Body() createDto: CreateBankAccountDto, @CurrentUser() user: User) {
    await this.weddingAccessService.assertAccess(createDto.weddingId, user);
    return this.bankAccountsService.create(createDto);
  }

  @Get('wedding/:weddingId')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'List all receiving bank accounts and QR codes for a wedding' })
  @ApiResponse({
    status: 200,
    description: 'List of bank accounts',
    type: [BankAccountResponseDto],
  })
  async findByWedding(
    @Param('weddingId', ParseUUIDPipe) weddingId: string,
    @CurrentUser() user: User,
  ) {
    await this.weddingAccessService.assertAccess(weddingId, user);
    return this.bankAccountsService.findByWedding(weddingId);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get details of a bank account' })
  @ApiResponse({
    status: 200,
    description: 'Bank account details',
    type: BankAccountResponseDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const account = await this.bankAccountsService.findById(id);
    await this.weddingAccessService.assertAccess(account.weddingId, user);
    return account;
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update bank account or QR code image' })
  @ApiResponse({
    status: 200,
    description: 'Bank account updated successfully',
    type: BankAccountResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBankAccountDto,
    @CurrentUser() user: User,
  ) {
    const account = await this.bankAccountsService.findById(id);
    await this.weddingAccessService.assertAccess(account.weddingId, user);
    return this.bankAccountsService.update(id, updateDto);
  }

  @Patch(':id/primary')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Set bank account as the primary default account for QR scanning' })
  @ApiResponse({
    status: 200,
    description: 'Primary bank account updated',
    type: BankAccountResponseDto,
  })
  async setPrimary(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const account = await this.bankAccountsService.findById(id);
    await this.weddingAccessService.assertAccess(account.weddingId, user);
    return this.bankAccountsService.setPrimary(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a bank account' })
  @ApiResponse({ status: 200, description: 'Bank account removed' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const account = await this.bankAccountsService.findById(id);
    await this.weddingAccessService.assertAccess(account.weddingId, user);
    return this.bankAccountsService.remove(id);
  }
}
