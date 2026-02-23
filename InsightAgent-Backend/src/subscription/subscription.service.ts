import {
  Injectable,
  ForbiddenException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TIER_LIMITS, TIER_PRICES, TierLimits } from './subscription.constants';
import { SubscriptionTier } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get tier limits for a specific tier
   */
  getTierLimits(tier: SubscriptionTier): TierLimits {
    return TIER_LIMITS[tier];
  }

  /**
   * Check if user can create a new project
   */
  async checkProjectLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { projects: true } } },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const limits = this.getTierLimits(user.tier);
    const currentProjects = user._count.projects;

    // -1 means unlimited
    if (limits.maxProjects !== -1 && currentProjects >= limits.maxProjects) {
      throw new ForbiddenException(
        `Project limit reached. Your ${user.tier} plan allows ${limits.maxProjects} projects. Upgrade to create more.`,
      );
    }
  }

  /**
   * Check if user can execute a query
   */
  async checkQueryLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const limits = this.getTierLimits(user.tier);

    // Check if we need to reset monthly usage
    const now = new Date();
    const resetDate = new Date(user.queriesResetAt);

    if (
      now.getMonth() !== resetDate.getMonth() ||
      now.getFullYear() !== resetDate.getFullYear()
    ) {
      // Reset usage for new month
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          queriesUsed: 0,
          queriesResetAt: now,
        },
      });
      return; // User can proceed with query
    }

    // -1 means unlimited
    if (
      limits.maxQueriesPerMonth !== -1 &&
      user.queriesUsed >= limits.maxQueriesPerMonth
    ) {
      throw new ForbiddenException(
        `Monthly query limit reached. Your ${user.tier} plan allows ${limits.maxQueriesPerMonth} queries per month. Upgrade for more queries.`,
      );
    }
  }

  /**
   * Increment query usage counter
   */
  async incrementQueryCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        queriesUsed: { increment: 1 },
      },
    });
  }

  /**
   * Check if file size is within tier limit
   */
  async checkFileSizeLimit(userId: string, fileSizeMB: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const limits = this.getTierLimits(user.tier);

    if (fileSizeMB > limits.maxFileSizeMB) {
      throw new PayloadTooLargeException(
        `File size exceeds limit. Your ${user.tier} plan allows files up to ${limits.maxFileSizeMB} MB. Upgrade for larger files.`,
      );
    }
  }

  /**
   * Get user's current usage statistics
   */
  async getUserUsage(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { projects: true } },
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
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

  /**
   * Reset monthly usage for all users (cron job)
   */
  async resetMonthlyUsage(): Promise<void> {
    const now = new Date();

    await this.prisma.user.updateMany({
      data: {
        queriesUsed: 0,
        queriesResetAt: now,
      },
    });
  }

  /**
   * Get all subscription plans with limits and prices (admin)
   */
  getPlans() {
    return Object.entries(TIER_LIMITS).map(([tier, limits]) => ({
      tier,
      limits,
      price: TIER_PRICES[tier as SubscriptionTier],
    }));
  }

  /**
   * Update a subscription plan's limits and price (admin)
   */
  updatePlan(
    tier: SubscriptionTier,
    data: { limits?: Partial<TierLimits>; price?: number },
  ) {
    if (data.limits) {
      TIER_LIMITS[tier] = { ...TIER_LIMITS[tier], ...data.limits };
    }
    if (data.price !== undefined) {
      TIER_PRICES[tier] = data.price;
    }
    return {
      tier,
      limits: TIER_LIMITS[tier],
      price: TIER_PRICES[tier],
    };
  }
}
