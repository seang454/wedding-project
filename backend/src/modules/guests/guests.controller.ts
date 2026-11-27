import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { QueryGuestDto } from './dto/query-guest.dto';
import { BatchCreateGuestDto } from './dto/batch-create-guest.dto';
import { GuestResponseDto } from './dto/guest-response.dto';
import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { WeddingAccessService } from '../../common/services/wedding-access.service';

@ApiTags('Guests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guests')
export class GuestsController {
  constructor(
    private readonly guestsService: GuestsService,
    private readonly weddingAccessService: WeddingAccessService,
  ) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a new guest (with Cambodia address: Province, District, Commune, Village)' })
  @ApiResponse({
    status: 201,
    description: 'Guest added successfully',
    type: GuestResponseDto,
  })
  async create(@Body() createGuestDto: CreateGuestDto, @CurrentUser() user: User) {
    await this.weddingAccessService.assertAccess(createGuestDto.weddingId, user);
    return this.guestsService.create(createGuestDto);
  }

  @Post('batch/:weddingId')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Batch import guests from parsed CSV/Excel file (up to 2,000 guests)' })
  @ApiResponse({
    status: 201,
    description: 'Batch import completed successfully',
    schema: {
      example: {
        success: true,
        data: { insertedCount: 450 },
      },
    },
  })
  async createBatch(
    @Param('weddingId', ParseUUIDPipe) weddingId: string,
    @Body() batchDto: BatchCreateGuestDto,
    @CurrentUser() user: User,
  ) {
    await this.weddingAccessService.assertAccess(weddingId, user);
    return this.guestsService.createBatch(weddingId, batchDto);
  }

  @Get('wedding/:weddingId/export')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get all guests for a wedding without pagination (for CSV/Excel export)' })
  @ApiResponse({
    status: 200,
    description: 'Complete unpaginated guest list for export',
    type: [GuestResponseDto],
  })
  async findAllForExport(
    @Param('weddingId', ParseUUIDPipe) weddingId: string,
    @CurrentUser() user: User,
  ) {
    await this.weddingAccessService.assertAccess(weddingId, user);
    return this.guestsService.findAllForExport(weddingId);
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Autocomplete guest search by name or phone for receptionist desk' })
  @ApiResponse({
    status: 200,
    description: 'List of matching guests',
    type: [GuestResponseDto],
  })
  async search(@Query() queryDto: QueryGuestDto, @CurrentUser() user: User) {
    await this.weddingAccessService.assertAccess(queryDto.weddingId, user);
    return this.guestsService.search(queryDto);
  }

  @Get('wedding/:weddingId')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get paginated list of guests for a wedding' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of guests',
  })
  async findAll(
    @Param('weddingId', ParseUUIDPipe) weddingId: string,
    @Query() pageOptionsDto: PageOptionsDto,
    @CurrentUser() user: User,
  ) {
    await this.weddingAccessService.assertAccess(weddingId, user);
    return this.guestsService.findAll(weddingId, pageOptionsDto);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get details of a single guest' })
  @ApiResponse({
    status: 200,
    description: 'Guest details with gift history',
    type: GuestResponseDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const guest = await this.guestsService.findById(id);
    await this.weddingAccessService.assertAccess(guest.weddingId, user);
    return guest;
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update guest info, table number, or attendance status' })
  @ApiResponse({
    status: 200,
    description: 'Guest updated successfully',
    type: GuestResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGuestDto: UpdateGuestDto,
    @CurrentUser() user: User,
  ) {
    const guest = await this.guestsService.findById(id);
    await this.weddingAccessService.assertAccess(guest.weddingId, user);
    return this.guestsService.update(id, updateGuestDto);
  }

  @Patch(':id/check-in')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN)
  @ApiOperation({ summary: '1-Click guest check-in (marks status as ATTENDED without requiring a gift)' })
  @ApiResponse({
    status: 200,
    description: 'Guest checked in successfully',
    type: GuestResponseDto,
  })
  async checkIn(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const guest = await this.guestsService.findById(id);
    await this.weddingAccessService.assertAccess(guest.weddingId, user);
    return this.guestsService.checkIn(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a guest' })
  @ApiResponse({ status: 200, description: 'Guest removed' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const guest = await this.guestsService.findById(id);
    await this.weddingAccessService.assertAccess(guest.weddingId, user);
    return this.guestsService.remove(id);
  }
}
