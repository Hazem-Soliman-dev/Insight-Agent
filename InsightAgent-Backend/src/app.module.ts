import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { UploadModule } from './upload/upload.module';
import { AgentModule } from './agent/agent.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    SubscriptionModule,
    ProjectsModule,
    UploadModule,
    AgentModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        try {
          const url = process.env.REDIS_URL;
          if (!url) {
            console.warn('REDIS_URL not set, using memory cache with 1h TTL');
            return { store: 'memory', ttl: 3600 * 1000 };
          }
          const store = await redisStore({
            url: url.trim(),
            ttl: 3600 * 1000, // 1 hour
          });
          return { store };
        } catch (error) {
          console.error(
            'Redis connection failed, using memory cache:',
            error instanceof Error ? error.message : 'Unknown error',
          );
          return { store: 'memory' };
        }
      },
    }),
  ],
})
export class AppModule {}
