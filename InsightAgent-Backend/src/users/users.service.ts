import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, SubscriptionTier } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        queriesUsed: true,
        queriesResetAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(
    page = 1,
    limit = 20,
    filters?: { tier?: string; role?: string; search?: string },
  ) {
    const skip = (page - 1) * limit;

    interface UserWhereQuery {
      tier?: SubscriptionTier;
      role?: Role;
      OR?: Array<
        | { email?: { contains: string; mode: 'insensitive' } }
        | { name?: { contains: string; mode: 'insensitive' } }
      >;
    }

    const where: UserWhereQuery = {};

    if (filters?.tier) {
      where.tier = filters.tier as SubscriptionTier;
    }

    if (filters?.role) {
      where.role = filters.role as Role;
    }

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tier: true,
          queriesUsed: true,
          queriesResetAt: true,
          createdAt: true,
          _count: {
            select: { projects: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneWithStats(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        queriesUsed: true,
        queriesResetAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getStats() {
    const [totalUsers, totalProjects, tierDistribution] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.user.groupBy({
        by: ['tier'],
        _count: true,
      }),
    ]);

    // Calculate total queries (sum of all users' queriesUsed)
    const queryStats = await this.prisma.user.aggregate({
      _sum: {
        queriesUsed: true,
      },
    });

    const tiers = tierDistribution.reduce(
      (acc, item) => {
        acc[item.tier] = item._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalUsers,
      totalProjects,
      totalQueries: queryStats._sum.queriesUsed || 0,
      tierDistribution: tiers,
    };
  }

  async updateTier(userId: string, updateTierDto: UpdateTierDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { tier: updateTierDto.tier },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
      },
    });
  }

  async updateRole(userId: string, updateRoleDto: UpdateRoleDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: updateRoleDto.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
      },
    });
  }

  async delete(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
