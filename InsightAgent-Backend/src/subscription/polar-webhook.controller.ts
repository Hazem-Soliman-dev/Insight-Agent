import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  validateEvent,
  WebhookVerificationError,
} from '@polar-sh/sdk/webhooks';

interface PolarOrder {
  id: string;
  status: string;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

interface PolarWebhookEvent {
  type: string;
  data: PolarOrder;
  [key: string]: unknown;
}

@Controller('polar')
export class PolarWebhookController {
  private readonly logger = new Logger(PolarWebhookController.name);

  constructor(private prisma: PrismaService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers() headers: Record<string, string>,
  ) {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      this.logger.error('POLAR_WEBHOOK_SECRET environment variable is not set');
      throw new BadRequestException('Webhook verification disabled');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    let event: PolarWebhookEvent;

    try {
      event = validateEvent(
        rawBody,
        headers,
        webhookSecret,
      ) as PolarWebhookEvent;
    } catch (err) {
      const errorMsg =
        err instanceof WebhookVerificationError ? err.message : 'Unknown error';
      this.logger.error(`Webhook signature verification failed: ${errorMsg}`);
      throw new BadRequestException(`Webhook Error: ${errorMsg}`);
    }

    this.logger.log(`Received Polar webhook event: ${event.type}`);

    if (event.type === 'order.created' || event.type === 'order.paid') {
      const order = event.data;
      await this.handleOrderPaid(order);
    }

    return { received: true };
  }

  private async handleOrderPaid(order: PolarOrder) {
    const userId = order.metadata?.userId;
    const creditsStr = order.metadata?.credits;

    if (!userId || !creditsStr) {
      this.logger.warn(
        `Received order event (id: ${order.id}) without userId or credits in metadata. Skipping.`,
      );
      return;
    }

    const credits = parseInt(creditsStr, 10);
    if (isNaN(credits)) {
      this.logger.error(`Invalid credits value in metadata: ${creditsStr}`);
      return;
    }

    if (order.status !== 'paid') {
      this.logger.log(
        `Order ${order.id} is not fully paid yet (status: ${order.status}). Skipping fulfillment.`,
      );
      return;
    }

    this.logger.log(
      `Processing credit purchase for user ${userId}: adding ${credits} credits`,
    );

    try {
      await this.prisma.$transaction(async (tx) => {
        // Increment user's credits balance
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            creditsBalance: { increment: credits },
          },
        });

        // Log the credit purchase transaction
        await tx.creditTransaction.create({
          data: {
            userId,
            amount: credits,
            type: 'PURCHASE',
          },
        });

        this.logger.log(
          `Successfully credited user ${userId}. New balance: ${updatedUser.creditsBalance}`,
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to persist credit purchase for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
