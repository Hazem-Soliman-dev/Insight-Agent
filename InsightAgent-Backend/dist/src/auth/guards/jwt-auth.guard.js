"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const backend_1 = require("@clerk/backend");
const prisma_service_1 = require("../../prisma/prisma.service");
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard {
    prisma;
    logger = new common_1.Logger(JwtAuthGuard_1.name);
    clerkClient = (0, backend_1.createClerkClient)({
        secretKey: process.env.CLERK_SECRET_KEY,
    });
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        const token = authHeader.split(' ')[1];
        try {
            const payload = await (0, backend_1.verifyToken)(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
            if (!payload || !payload.sub) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            const clerkUserId = payload.sub;
            let localUser = await this.prisma.user.findUnique({
                where: { clerkUserId },
            });
            if (!localUser) {
                this.logger.log(`User ${clerkUserId} not found locally. Syncing from Clerk...`);
                try {
                    const clerkUser = await this.clerkClient.users.getUser(clerkUserId);
                    const email = clerkUser.emailAddresses[0]?.emailAddress;
                    if (!email) {
                        throw new Error('User has no email address on Clerk');
                    }
                    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
                        null;
                    localUser = await this.prisma.user.create({
                        data: {
                            clerkUserId,
                            email,
                            name,
                            creditsBalance: 5,
                        },
                    });
                    this.logger.log(`Created local user for clerk user ${clerkUserId} with email ${email}`);
                }
                catch (error) {
                    this.logger.error(`Failed to sync clerk user ${clerkUserId}:`, error);
                    throw new common_1.UnauthorizedException('Could not sync user metadata');
                }
            }
            request.user = localUser;
            return true;
        }
        catch (error) {
            this.logger.error('Authentication failed:', error);
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map