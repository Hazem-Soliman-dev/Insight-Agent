import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.id);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  // Admin endpoints
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getStats() {
    return this.usersService.getStats();
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('tier') tier?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(page, limit, { tier, role, search });
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findOne(@Param('id') userId: string) {
    return this.usersService.findOneWithStats(userId);
  }

  @Patch(':id/tier')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateTier(
    @Param('id') userId: string,
    @Body() updateTierDto: UpdateTierDto,
  ) {
    return this.usersService.updateTier(userId, updateTierDto);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateRole(
    @Param('id') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(userId, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') userId: string) {
    await this.usersService.delete(userId);
    return { message: 'User deleted successfully' };
  }
}
