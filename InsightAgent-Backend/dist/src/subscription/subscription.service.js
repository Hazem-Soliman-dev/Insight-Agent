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
const sdk_1 = require("@polar-sh/sdk");
const prisma_service_1 = require("../prisma/prisma.service");
let SubscriptionService = class SubscriptionService {
    prisma;
    MAX_PROJECTS = 10;
    MAX_FILE_SIZE_MB = 20;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkProjectLimit(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { _count: { select: { projects: true } } },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        const currentProjects = user._count.projects;
        if (currentProjects >= this.MAX_PROJECTS) {
            throw new common_1.ForbiddenException(`Project limit reached. You can create a maximum of ${this.MAX_PROJECTS} projects. Contact support to increase this limit.`);
        }
    }
    async checkQueryLimit(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        if (user.creditsBalance <= 0) {
            throw new common_1.ForbiddenException('You have run out of credits. Please purchase more credits to continue.');
        }
    }
    async incrementQueryCount(userId) {
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    creditsBalance: { decrement: 1 },
                },
            });
            await tx.creditTransaction.create({
                data: {
                    userId,
                    amount: -1,
                    type: 'USAGE',
                },
            });
        });
    }
    async checkFileSizeLimit(userId, fileSizeMB) {
        if (fileSizeMB > this.MAX_FILE_SIZE_MB) {
            throw new common_1.PayloadTooLargeException(`File size exceeds limit. Maximum file size allowed is ${this.MAX_FILE_SIZE_MB} MB.`);
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
        const queryCount = await this.prisma.creditTransaction.count({
            where: {
                userId,
                type: 'USAGE',
            },
        });
        return {
            creditsBalance: user.creditsBalance,
            projects: {
                used: user._count.projects,
                limit: this.MAX_PROJECTS,
            },
            queries: {
                totalExecuted: queryCount,
            },
            fileSize: {
                limit: this.MAX_FILE_SIZE_MB,
            },
        };
    }
    getPlans() {
        return [
            {
                id: 'credits-starter',
                name: 'Starter Credits Pack',
                credits: 20,
                price: 5.00,
                description: 'Perfect for trying out new insights',
            },
            {
                id: 'credits-growth',
                name: 'Growth Credits Pack',
                credits: 100,
                price: 19.00,
                description: 'Best for regular analysis',
            },
            {
                id: 'credits-power',
                name: 'Power Credits Pack',
                credits: 500,
                price: 59.00,
                description: 'Ideal for power users and teams',
            },
        ];
    }
    async createCheckoutSession(userId, planId) {
        const plans = this.getPlans();
        const plan = plans.find((p) => p.id === planId);
        if (!plan) {
            throw new common_1.ForbiddenException('Invalid credit plan selected');
        }
        let productId = '';
        if (planId === 'credits-starter') {
            productId = process.env.POLAR_STARTER_PRODUCT_ID || '';
        }
        else if (planId === 'credits-growth') {
            productId = process.env.POLAR_GROWTH_PRODUCT_ID || '';
        }
        else if (planId === 'credits-power') {
            productId = process.env.POLAR_POWER_PRODUCT_ID || '';
        }
        if (!productId) {
            throw new common_1.ForbiddenException('Polar Product ID is not configured for this plan. Please check backend environment variables.');
        }
        const polar = new sdk_1.Polar({
            accessToken: process.env.POLAR_ACCESS_TOKEN || '',
            server: process.env.NODE_ENV === 'development' ? 'sandbox' : undefined,
        });
        try {
            const checkout = await polar.checkouts.create({
                products: [productId],
                successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?payment=success`,
                metadata: {
                    userId,
                    credits: String(plan.credits),
                    planId: plan.id,
                },
            });
            return { url: checkout.url || null };
        }
        catch (error) {
            throw new common_1.ForbiddenException(`Failed to create Polar Checkout Session: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map