import { SubscriptionService } from './subscription.service';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { SubscriptionTier } from '@prisma/client';
import { TierLimits } from './subscription.constants';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getUsage(user: JwtPayload): Promise<{
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
    getPlans(): Promise<{
        tier: string;
        limits: TierLimits;
        price: number;
    }[]>;
    updatePlan(tier: SubscriptionTier, data: {
        limits?: Partial<TierLimits>;
        price?: number;
    }): Promise<{
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        limits: TierLimits;
        price: number;
    }>;
}
