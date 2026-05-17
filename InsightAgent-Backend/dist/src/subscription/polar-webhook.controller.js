"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PolarWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolarWebhookController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const webhooks_1 = require("@polar-sh/sdk/webhooks");
let PolarWebhookController = PolarWebhookController_1 = class PolarWebhookController {
    prisma;
    logger = new common_1.Logger(PolarWebhookController_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleWebhook(req, headers) {
        const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
        if (!webhookSecret) {
            this.logger.error('POLAR_WEBHOOK_SECRET environment variable is not set');
            throw new common_1.BadRequestException('Webhook verification disabled');
        }
        const rawBody = req.rawBody;
        if (!rawBody) {
            throw new common_1.BadRequestException('Missing raw request body');
        }
        let event;
        try {
            event = (0, webhooks_1.validateEvent)(rawBody, headers, webhookSecret);
        }
        catch (err) {
            const errorMsg = err instanceof webhooks_1.WebhookVerificationError ? err.message : 'Unknown error';
            this.logger.error(`Webhook signature verification failed: ${errorMsg}`);
            throw new common_1.BadRequestException(`Webhook Error: ${errorMsg}`);
        }
        this.logger.log(`Received Polar webhook event: ${event.type}`);
        if (event.type === 'order.created' || event.type === 'order.paid') {
            const order = event.data;
            await this.handleOrderPaid(order);
        }
        return { received: true };
    }
    async handleOrderPaid(order) {
        const userId = order.metadata?.userId;
        const creditsStr = order.metadata?.credits;
        if (!userId || !creditsStr) {
            this.logger.warn(`Received order event (id: ${order.id}) without userId or credits in metadata. Skipping.`);
            return;
        }
        const credits = parseInt(creditsStr, 10);
        if (isNaN(credits)) {
            this.logger.error(`Invalid credits value in metadata: ${creditsStr}`);
            return;
        }
        if (order.status !== 'paid') {
            this.logger.log(`Order ${order.id} is not fully paid yet (status: ${order.status}). Skipping fulfillment.`);
            return;
        }
        this.logger.log(`Processing credit purchase for user ${userId}: adding ${credits} credits`);
        try {
            await this.prisma.$transaction(async (tx) => {
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: {
                        creditsBalance: { increment: credits },
                    },
                });
                await tx.creditTransaction.create({
                    data: {
                        userId,
                        amount: credits,
                        type: 'PURCHASE',
                    },
                });
                this.logger.log(`Successfully credited user ${userId}. New balance: ${updatedUser.creditsBalance}`);
            });
        }
        catch (error) {
            this.logger.error(`Failed to persist credit purchase for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.PolarWebhookController = PolarWebhookController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PolarWebhookController.prototype, "handleWebhook", null);
exports.PolarWebhookController = PolarWebhookController = PolarWebhookController_1 = __decorate([
    (0, common_1.Controller)('polar'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PolarWebhookController);
//# sourceMappingURL=polar-webhook.controller.js.map