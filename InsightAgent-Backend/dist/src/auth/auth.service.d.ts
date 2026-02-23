import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            createdAt: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            createdAt: Date;
        };
    }>;
    refreshToken(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
}
