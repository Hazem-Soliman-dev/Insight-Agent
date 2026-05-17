import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
export declare class PolarWebhookController {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleWebhook(req: Request & {
        rawBody?: Buffer;
    }, headers: any): Promise<{
        received: boolean;
    }>;
    private handleOrderPaid;
}
