import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './decorators/current-user.decorator';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getProfile(user: JwtPayload): {
        user: JwtPayload;
    };
    refresh(user: JwtPayload): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
