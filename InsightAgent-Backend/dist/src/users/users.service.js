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
                creditsBalance: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findAll(page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOneWithStats(id) {
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
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getStats() {
        const [totalUsers, totalProjects, totalCreditsStats, starterCount, regularCount, growthCount, powerCount,] = await Promise.all([
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
    async updateCredits(userId, credits) {
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
    async updateRole(userId, updateRoleDto) {
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