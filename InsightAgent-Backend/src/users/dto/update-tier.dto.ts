import { IsEnum } from 'class-validator';
import { SubscriptionTier } from '@prisma/client';

export class UpdateTierDto {
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;
}
