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
import { WeddingsService } from './weddings.service';
import { WeddingAccessService } from '../../common/services/wedding-access.service';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { WeddingResponseDto } from './dto/wedding-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Weddings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('weddings')
export class WeddingsController {
  constructor(
    private readonly weddingsService: WeddingsService,
    private readonly weddingAccessService: WeddingAccessService,
  ) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new wedding event' })
  @ApiResponse({
    status: 201,
    description: 'Wedding successfully created',
    type: WeddingResponseDto,
  })
  create(
    @Body() createWeddingDto: CreateWeddingDto,
    @CurrentUser() user: User,
  ) {
    return this.weddingsService.create(createWeddingDto, user.id);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'List weddings (owned by owner or assigned to clerk)' })
  @ApiResponse({
    status: 200,
    description: 'List of weddings',
    type: [WeddingResponseDto],
  })
  findAll(@CurrentUser() user: User) {
    if (user.role === UserRole.CLERK || user.role === UserRole.ACCOUNTANT) {
      return this.weddingsService.findAllAssignedToClerk(user.id);
    }
    return this.weddingsService.findAllByOwner(user.id);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.CLERK, UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Get details of a specific wedding by ID' })
  @ApiResponse({
    status: 200,
    description: 'Wedding details',
    type: WeddingResponseDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    if (user.role === UserRole.CLERK || user.role === UserRole.ACCOUNTANT) {
      return this.weddingsService.findByIdForClerk(id, user.id);
    }
    await this.weddingAccessService.assertAccess(id, user);
    return this.weddingsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update wedding information' })
  @ApiResponse({
    status: 200,
    description: 'Wedding successfully updated',
    type: WeddingResponseDto,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWeddingDto: UpdateWeddingDto,
    @CurrentUser() user: User,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.weddingsService.update(id, updateWeddingDto, user.id, isAdmin);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a wedding event' })
  @ApiResponse({ status: 200, description: 'Wedding successfully deleted' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.weddingsService.remove(id, user.id, isAdmin);
  }
}
