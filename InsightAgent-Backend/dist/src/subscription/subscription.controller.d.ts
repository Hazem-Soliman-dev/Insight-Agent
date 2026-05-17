import { SubscriptionService } from './subscription.service';
import * as client from '@prisma/client';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getUsage(user: client.User): Promise<{
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
    getPlans(): Promise<{
        id: string;
        name: string;
        credits: number;
        price: number;
        description: string;
    }[]>;
    checkout(user: client.User, planId: string): Promise<{
        url: string | null;
    }>;
}
