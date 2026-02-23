import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<{
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
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(page?: number, limit?: number, filters?: {
        tier?: string;
        role?: string;
        search?: string;
    }): Promise<{
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
    findOneWithStats(id: string): Promise<{
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
    getStats(): Promise<{
        totalUsers: number;
        totalProjects: number;
        totalQueries: number;
        tierDistribution: Record<string, number>;
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
    delete(userId: string): Promise<void>;
}
