import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as client from '@prisma/client';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('usage')
  async getUsage(@CurrentUser() user: client.User) {
    return await this.subscriptionService.getUserUsage(user.id);
  }

  @Get('plans')
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Post('checkout')
  async checkout(
    @CurrentUser() user: client.User,
    @Body('planId') planId: string,
  ) {
    return await this.subscriptionService.createCheckoutSession(
      user.id,
      planId,
    );
  }
}
