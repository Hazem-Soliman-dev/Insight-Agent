import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import * as client from '@prisma/client';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: client.User): Promise<{
        name: string | null;
        id: string;
        clerkUserId: string;
        email: string;
        role: client.$Enums.Role;
        creditsBalance: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(user: client.User, updateProfileDto: UpdateProfileDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: client.$Enums.Role;
        creditsBalance: number;
        createdAt: Date;
        updatedAt: Date;
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
    findAll(page?: number, limit?: number, role?: string, search?: string): Promise<{
        users: {
            name: string | null;
            id: string;
            clerkUserId: string;
            email: string;
            role: client.$Enums.Role;
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
    findOne(userId: string): Promise<{
        name: string | null;
        id: string;
        clerkUserId: string;
        email: string;
        role: client.$Enums.Role;
        creditsBalance: number;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            projects: number;
        };
    }>;
    updateCredits(userId: string, credits: number): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: client.$Enums.Role;
        creditsBalance: number;
    }>;
    updateRole(userId: string, updateRoleDto: UpdateRoleDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: client.$Enums.Role;
        creditsBalance: number;
    }>;
    delete(userId: string): Promise<{
        message: string;
    }>;
}
