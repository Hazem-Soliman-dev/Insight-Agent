import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<{
        name: string | null;
        id: string;
        clerkUserId: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        creditsBalance: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        creditsBalance: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(page?: number, limit?: number, filters?: {
        role?: string;
        search?: string;
    }): Promise<{
        users: {
            name: string | null;
            id: string;
            clerkUserId: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            creditsBalance: number;
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
        clerkUserId: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        creditsBalance: number;
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
        totalCreditsBalance: number;
        tierDistribution: {
            'Starter (0-5 credits)': number;
            'Regular (6-20 credits)': number;
            'Growth (21-100 credits)': number;
            'Power (101+ credits)': number;
        };
    }>;
    updateCredits(userId: string, credits: number): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        creditsBalance: number;
    }>;
    updateRole(userId: string, updateRoleDto: UpdateRoleDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        creditsBalance: number;
    }>;
    delete(userId: string): Promise<void>;
}
