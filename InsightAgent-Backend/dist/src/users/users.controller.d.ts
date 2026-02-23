import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: JwtPayload): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        queriesUsed: number;
        queriesResetAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(user: JwtPayload, updateProfileDto: UpdateProfileDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getStats(): Promise<{
        totalUsers: number;
        totalProjects: number;
        totalQueries: number;
        tierDistribution: Record<string, number>;
    }>;
    findAll(page?: number, limit?: number, tier?: string, role?: string, search?: string): Promise<{
        users: {
            name: string | null;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            queriesUsed: number;
            queriesResetAt: Date;
            createdAt: Date;
            _count: {
                projects: number;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(userId: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        queriesUsed: number;
        queriesResetAt: Date;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            projects: number;
        };
    }>;
    updateTier(userId: string, updateTierDto: UpdateTierDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
    }>;
    updateRole(userId: string, updateRoleDto: UpdateRoleDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
    }>;
    delete(userId: string): Promise<{
        message: string;
    }>;
}
