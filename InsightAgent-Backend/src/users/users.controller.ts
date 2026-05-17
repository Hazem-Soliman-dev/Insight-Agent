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
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as client from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: client.User) {
    return this.usersService.findOne(user.id);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: client.User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  // Admin endpoints
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(client.Role.ADMIN)
  async getStats() {
    return this.usersService.getStats();
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(client.Role.ADMIN)
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(page, limit, { role, search });
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(client.Role.ADMIN)
  async findOne(@Param('id') userId: string) {
    return this.usersService.findOneWithStats(userId);
  }

  @Patch(':id/credits')
  @UseGuards(RolesGuard)
  @Roles(client.Role.ADMIN)
  async updateCredits(
    @Param('id') userId: string,
    @Body('credits', ParseIntPipe) credits: number,
  ) {
    return this.usersService.updateCredits(userId, credits);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(client.Role.ADMIN)
  async updateRole(
    @Param('id') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(userId, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(client.Role.ADMIN)
  async delete(@Param('id') userId: string) {
    await this.usersService.delete(userId);
    return { message: 'User deleted successfully' };
  }
}
