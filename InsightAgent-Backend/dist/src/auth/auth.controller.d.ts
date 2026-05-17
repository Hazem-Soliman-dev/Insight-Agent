import * as client from '@prisma/client';
export declare class AuthController {
    getProfile(user: client.User): {
        user: {
            name: string | null;
            id: string;
            clerkUserId: string;
            email: string;
            role: client.$Enums.Role;
            creditsBalance: number;
            createdAt: Date;
            updatedAt: Date;
        };
    };
}
