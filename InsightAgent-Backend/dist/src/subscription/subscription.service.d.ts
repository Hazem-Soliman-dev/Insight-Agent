import { PrismaService } from '../prisma/prisma.service';
import { TierLimits } from './subscription.constants';
import { SubscriptionTier } from '@prisma/client';
export declare class SubscriptionService {
    private prisma;
    constructor(prisma: PrismaService);
    getTierLimits(tier: SubscriptionTier): TierLimits;
    checkProjectLimit(userId: string): Promise<void>;
    checkQueryLimit(userId: string): Promise<void>;
    incrementQueryCount(userId: string): Promise<void>;
    checkFileSizeLimit(userId: string, fileSizeMB: number): Promise<void>;
    getUserUsage(userId: string): Promise<{
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        projects: {
            used: number;
            limit: number;
        };
        queries: {
            used: number;
            limit: number;
            resetAt: Date;
        };
        fileSize: {
            limit: number;
        };
    }>;
    resetMonthlyUsage(): Promise<void>;
    getPlans(): {
        tier: string;
        limits: TierLimits;
        price: number;
    }[];
    updatePlan(tier: SubscriptionTier, data: {
        limits?: Partial<TierLimits>;
        price?: number;
    }): {
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        limits: TierLimits;
        price: number;
    };
}
