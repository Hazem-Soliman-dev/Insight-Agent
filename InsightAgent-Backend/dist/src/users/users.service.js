"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(userId, updateProfileDto) {
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
    async findAll(page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.tier) {
            where.tier = filters.tier;
        }
        if (filters?.role) {
            where.role = filters.role;
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
    async findOneWithStats(id) {
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
            throw new common_1.NotFoundException('User not found');
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
        const queryStats = await this.prisma.user.aggregate({
            _sum: {
                queriesUsed: true,
            },
        });
        const tiers = tierDistribution.reduce((acc, item) => {
            acc[item.tier] = item._count;
            return acc;
        }, {});
        return {
            totalUsers,
            totalProjects,
            totalQueries: queryStats._sum.queriesUsed || 0,
            tierDistribution: tiers,
        };
    }
    async updateTier(userId, updateTierDto) {
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
    async updateRole(userId, updateRoleDto) {
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
    async delete(userId) {
        await this.prisma.user.delete({
            where: { id: userId },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map