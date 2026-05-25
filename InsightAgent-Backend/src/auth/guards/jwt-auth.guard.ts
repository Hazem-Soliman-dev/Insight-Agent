import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { PrismaService } from '../../prisma/prisma.service';
import type { Request } from 'express';
import type { User as PrismaUser } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: PrismaUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token with Clerk
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      const clerkUserId = payload.sub;

      // Find or create local user
      let localUser = await this.prisma.user.findUnique({
        where: { clerkUserId },
      });

      if (!localUser) {
        this.logger.log(
          `User ${clerkUserId} not found locally. Syncing from Clerk...`,
        );

        try {
          // Fetch complete user details from Clerk
          const clerkUser = await this.clerkClient.users.getUser(clerkUserId);
          const email = clerkUser.emailAddresses[0]?.emailAddress;

          if (!email) {
            throw new Error('User has no email address on Clerk');
          }

          const name =
            `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
            null;

          // Check if a user with the same email already exists
          const existingUserByEmail = await this.prisma.user.findUnique({
            where: { email },
          });

          if (existingUserByEmail) {
            // Update the existing user's clerkUserId
            localUser = await this.prisma.user.update({
              where: { email },
              data: {
                clerkUserId,
                name: existingUserByEmail.name || name,
              },
            });
            this.logger.log(
              `Linked existing local user (email: ${email}) with new clerkUserId ${clerkUserId}`,
            );
          } else {
            // Create a new user
            localUser = await this.prisma.user.create({
              data: {
                clerkUserId,
                email,
                name,
                creditsBalance: 5, // free startup credits
              },
            });
            this.logger.log(
              `Created local user for clerk user ${clerkUserId} with email ${email}`,
            );
          }
        } catch (error) {
          this.logger.error(`Failed to sync clerk user ${clerkUserId}:`, error);
          throw new UnauthorizedException('Could not sync user metadata');
        }
      }

      // Attach user to the request
      request.user = localUser;
      return true;
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
