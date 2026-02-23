import { SubscriptionTier } from '@prisma/client';
export interface TierLimits {
    maxProjects: number;
    maxQueriesPerMonth: number;
    maxFileSizeMB: number;
    dataRetentionDays: number;
}
export declare let TIER_LIMITS: Record<SubscriptionTier, TierLimits>;
export declare let TIER_PRICES: {
    FREE: number;
    PRO: number;
    ENTERPRISE: number;
};
