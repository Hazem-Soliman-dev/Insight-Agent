import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        role: true,
        creditsBalance: true,
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
        creditsBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(
    page = 1,
    limit = 20,
    filters?: { role?: string; search?: string },
  ) {
    const skip = (page - 1) * limit;

    interface UserWhereQuery {
      role?: Role;
      OR?: Array<
        | { email?: { contains: string; mode: 'insensitive' } }
        | { name?: { contains: string; mode: 'insensitive' } }
      >;
    }

    const where: UserWhereQuery = {};

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
          clerkUserId: true,
          email: true,
          name: true,
          role: true,
          creditsBalance: true,
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
        clerkUserId: true,
        email: true,
        name: true,
        role: true,
        creditsBalance: true,
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
    const [
      totalUsers,
      totalProjects,
      totalCreditsStats,
      starterCount,
      regularCount,
      growthCount,
      powerCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.user.aggregate({
        _sum: {
          creditsBalance: true,
        },
      }),
      this.prisma.user.count({ where: { creditsBalance: { lte: 5 } } }),
      this.prisma.user.count({ where: { creditsBalance: { gt: 5, lte: 20 } } }),
      this.prisma.user.count({
        where: { creditsBalance: { gt: 20, lte: 100 } },
      }),
      this.prisma.user.count({ where: { creditsBalance: { gt: 100 } } }),
    ]);

    // Calculate total queries (count of all USAGE credit transactions)
    const queryStats = await this.prisma.creditTransaction.count({
      where: {
        type: 'USAGE',
      },
    });

    return {
      totalUsers,
      totalProjects,
      totalQueries: queryStats || 0,
      totalCreditsBalance: totalCreditsStats._sum.creditsBalance || 0,
      tierDistribution: {
        'Starter (0-5 credits)': starterCount,
        'Regular (6-20 credits)': regularCount,
        'Growth (21-100 credits)': growthCount,
        'Power (101+ credits)': powerCount,
      },
    };
  }

  async updateCredits(userId: string, credits: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { creditsBalance: credits },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        creditsBalance: true,
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
        creditsBalance: true,
      },
    });
  }

  async delete(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
