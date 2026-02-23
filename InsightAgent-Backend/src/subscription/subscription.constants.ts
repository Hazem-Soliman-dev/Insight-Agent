import { SubscriptionTier } from '@prisma/client';

export interface TierLimits {
  maxProjects: number; // -1 = unlimited
  maxQueriesPerMonth: number; // -1 = unlimited
  maxFileSizeMB: number;
  dataRetentionDays: number; // -1 = unlimited
}

export let TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    maxProjects: 3,
    maxQueriesPerMonth: 50,
    maxFileSizeMB: 5,
    dataRetentionDays: 30,
  },
  PRO: {
    maxProjects: 20,
    maxQueriesPerMonth: 500,
    maxFileSizeMB: 50,
    dataRetentionDays: 365,
  },
  ENTERPRISE: {
    maxProjects: -1, // unlimited
    maxQueriesPerMonth: 5000,
    maxFileSizeMB: 100,
    dataRetentionDays: -1, // unlimited
  },
};

export let TIER_PRICES = {
  FREE: 0,
  PRO: 29,
  ENTERPRISE: 99,
};
