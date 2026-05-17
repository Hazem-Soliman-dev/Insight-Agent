import {
  Injectable,
  ForbiddenException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Polar } from '@polar-sh/sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  private readonly MAX_PROJECTS = 10;
  private readonly MAX_FILE_SIZE_MB = 20;

  constructor(private prisma: PrismaService) {}

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

    const currentProjects = user._count.projects;

    if (currentProjects >= this.MAX_PROJECTS) {
      throw new ForbiddenException(
        `Project limit reached. You can create a maximum of ${this.MAX_PROJECTS} projects. Contact support to increase this limit.`,
      );
    }
  }

  /**
   * Check if user can execute a query (has credits)
   */
  async checkQueryLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.creditsBalance <= 0) {
      throw new ForbiddenException(
        'You have run out of credits. Please purchase more credits to continue.',
      );
    }
  }

  /**
   * Increment query usage counter (deduct credit)
   */
  async incrementQueryCount(userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Deduct 1 credit
      await tx.user.update({
        where: { id: userId },
        data: {
          creditsBalance: { decrement: 1 },
        },
      });

      // Log transaction
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -1,
          type: 'USAGE',
        },
      });
    });
  }

  /**
   * Check if file size is within global limit
   */

  async checkFileSizeLimit(userId: string, fileSizeMB: number): Promise<void> {
    await Promise.resolve();
    if (fileSizeMB > this.MAX_FILE_SIZE_MB) {
      throw new PayloadTooLargeException(
        `File size exceeds limit. Maximum file size allowed is ${this.MAX_FILE_SIZE_MB} MB.`,
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

    // Get number of queries executed by counting USAGE transactions
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

  /**
   * Get all credit plans
   */
  getPlans() {
    return [
      {
        id: 'credits-starter',
        name: 'Starter Credits Pack',
        credits: 20,
        price: 5.0,
        description: 'Perfect for trying out new insights',
      },
      {
        id: 'credits-growth',
        name: 'Growth Credits Pack',
        credits: 100,
        price: 19.0,
        description: 'Best for regular analysis',
      },
      {
        id: 'credits-power',
        name: 'Power Credits Pack',
        credits: 500,
        price: 59.0,
        description: 'Ideal for power users and teams',
      },
    ];
  }

  /**
   * Create a Polar Checkout Session for a credit pack purchase
   */
  async createCheckoutSession(
    userId: string,
    planId: string,
  ): Promise<{ url: string | null }> {
    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === planId);

    if (!plan) {
      throw new ForbiddenException('Invalid credit plan selected');
    }

    // Map plan ID to Polar Product ID
    let productId = '';
    if (planId === 'credits-starter') {
      productId = process.env.POLAR_STARTER_PRODUCT_ID || '';
    } else if (planId === 'credits-growth') {
      productId = process.env.POLAR_GROWTH_PRODUCT_ID || '';
    } else if (planId === 'credits-power') {
      productId = process.env.POLAR_POWER_PRODUCT_ID || '';
    }

    if (!productId) {
      throw new ForbiddenException(
        'Polar Product ID is not configured for this plan. Please check backend environment variables.',
      );
    }

    const polar = new Polar({
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
    } catch (error) {
      throw new ForbiddenException(
        `Failed to create Polar Checkout Session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
