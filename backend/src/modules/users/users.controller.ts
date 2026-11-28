import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateClerkDto, AssignClerkWeddingsDto, UpdateClerkDto } from './dto/create-clerk.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';

@ApiTags('Users & Clerks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('clerks')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List clerks created by the current owner with assigned weddings' })
  findClerks(@CurrentUser() user: User) {
    return this.usersService.findClerks(user.id, user.role === UserRole.ADMIN);
  }

  @Post('clerks')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new clerk account and optionally assign weddings' })
  createClerk(@Body() dto: CreateClerkDto, @CurrentUser() user: User) {
    return this.usersService.createClerk(dto, user.id);
  }

  @Patch('clerks/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a clerk account and assigned weddings' })
  updateClerk(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClerkDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.updateClerk(id, dto, user.id, user.role === UserRole.ADMIN);
  }

  @Patch('clerks/:id/weddings')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign weddings to a clerk' })
  assignClerkWeddings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignClerkWeddingsDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.assignClerkWeddings(
      id,
      dto.weddingIds,
      user.id,
      user.role === UserRole.ADMIN,
    );
  }

  @Delete('clerks/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a clerk account' })
  removeClerk(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.usersService.removeClerk(id, user.id, user.role === UserRole.ADMIN);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get details of a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserResponseDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: User) {
    const found = await this.usersService.findById(id);
    if (!found) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isSelf = found.id === currentUser.id;
    const isOwnClerk =
      found.role === UserRole.CLERK && found.createdByOwnerId === currentUser.id;

    if (!isAdmin && !isSelf && !isOwnClerk) {
      throw new ForbiddenException('You do not have permission to view this user');
    }

    const { passwordHash: _pw, ...safeUser } = found;
    return safeUser;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all registered users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(({ passwordHash: _pw, ...rest }) => rest);
  }
}
