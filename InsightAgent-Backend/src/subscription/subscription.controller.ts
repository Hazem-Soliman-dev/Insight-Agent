import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { Role, SubscriptionTier } from '@prisma/client';
import { TierLimits } from './subscription.constants';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('usage')
  async getUsage(@CurrentUser() user: JwtPayload) {
    return this.subscriptionService.getUserUsage(user.id);
  }

  @Get('plans')
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Put('plans/:tier')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updatePlan(
    @Param('tier') tier: SubscriptionTier,
    @Body() data: { limits?: Partial<TierLimits>; price?: number },
  ) {
    return this.subscriptionService.updatePlan(tier, data);
  }
}
