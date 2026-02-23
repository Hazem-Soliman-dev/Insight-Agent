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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const subscription_constants_1 = require("./subscription.constants");
let SubscriptionService = class SubscriptionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTierLimits(tier) {
        return subscription_constants_1.TIER_LIMITS[tier];
    }
    async checkProjectLimit(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { _count: { select: { projects: true } } },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        const limits = this.getTierLimits(user.tier);
        const currentProjects = user._count.projects;
        if (limits.maxProjects !== -1 && currentProjects >= limits.maxProjects) {
            throw new common_1.ForbiddenException(`Project limit reached. Your ${user.tier} plan allows ${limits.maxProjects} projects. Upgrade to create more.`);
        }
    }
    async checkQueryLimit(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        const limits = this.getTierLimits(user.tier);
        const now = new Date();
        const resetDate = new Date(user.queriesResetAt);
        if (now.getMonth() !== resetDate.getMonth() ||
            now.getFullYear() !== resetDate.getFullYear()) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    queriesUsed: 0,
                    queriesResetAt: now,
                },
            });
            return;
        }
        if (limits.maxQueriesPerMonth !== -1 &&
            user.queriesUsed >= limits.maxQueriesPerMonth) {
            throw new common_1.ForbiddenException(`Monthly query limit reached. Your ${user.tier} plan allows ${limits.maxQueriesPerMonth} queries per month. Upgrade for more queries.`);
        }
    }
    async incrementQueryCount(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                queriesUsed: { increment: 1 },
            },
        });
    }
    async checkFileSizeLimit(userId, fileSizeMB) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        const limits = this.getTierLimits(user.tier);
        if (fileSizeMB > limits.maxFileSizeMB) {
            throw new common_1.PayloadTooLargeException(`File size exceeds limit. Your ${user.tier} plan allows files up to ${limits.maxFileSizeMB} MB. Upgrade for larger files.`);
        }
    }
    async getUserUsage(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: { select: { projects: true } },
            },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        const limits = this.getTierLimits(user.tier);
        return {
            tier: user.tier,
            projects: {
                used: user._count.projects,
                limit: limits.maxProjects,
            },
            queries: {
                used: user.queriesUsed,
                limit: limits.maxQueriesPerMonth,
                resetAt: user.queriesResetAt,
            },
            fileSize: {
                limit: limits.maxFileSizeMB,
            },
        };
    }
    async resetMonthlyUsage() {
        const now = new Date();
        await this.prisma.user.updateMany({
            data: {
                queriesUsed: 0,
                queriesResetAt: now,
            },
        });
    }
    getPlans() {
        return Object.entries(subscription_constants_1.TIER_LIMITS).map(([tier, limits]) => ({
            tier,
            limits,
            price: subscription_constants_1.TIER_PRICES[tier],
        }));
    }
    updatePlan(tier, data) {
        if (data.limits) {
            subscription_constants_1.TIER_LIMITS[tier] = { ...subscription_constants_1.TIER_LIMITS[tier], ...data.limits };
        }
        if (data.price !== undefined) {
            subscription_constants_1.TIER_PRICES[tier] = data.price;
        }
        return {
            tier,
            limits: subscription_constants_1.TIER_LIMITS[tier],
            price: subscription_constants_1.TIER_PRICES[tier],
        };
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map