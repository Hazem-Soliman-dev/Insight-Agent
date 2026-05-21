import { PrismaService } from '../prisma/prisma.service';
export declare class SubscriptionService {
    private prisma;
    private readonly logger;
    private readonly MAX_PROJECTS;
    private readonly MAX_FILE_SIZE_MB;
    constructor(prisma: PrismaService);
    private validateEnv;
    checkProjectLimit(userId: string): Promise<void>;
    checkQueryLimit(userId: string): Promise<void>;
    incrementQueryCount(userId: string): Promise<void>;
    checkFileSizeLimit(userId: string, fileSizeMB: number): Promise<void>;
    getUserUsage(userId: string): Promise<{
        creditsBalance: number;
        projects: {
            used: number;
            limit: number;
        };
        queries: {
            totalExecuted: number;
        };
        fileSize: {
            limit: number;
        };
    }>;
    getPlans(): {
        id: string;
        name: string;
        credits: number;
        price: number;
        description: string;
    }[];
    createCheckoutSession(userId: string, planId: string): Promise<{
        url: string | null;
    }>;
}
