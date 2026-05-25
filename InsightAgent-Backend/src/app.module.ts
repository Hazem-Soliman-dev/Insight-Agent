import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createClient } from 'redis';
import { redisInsStore } from 'cache-manager-redis-yet';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { UploadModule } from './upload/upload.module';
import { AgentModule } from './agent/agent.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
        let client;
        try {
          const url = process.env.REDIS_URL;
          if (!url) {
            console.warn('REDIS_URL not set, using memory cache with 1h TTL');
            return { store: 'memory', ttl: 3600 * 1000 };
          }
          
          client = createClient({
            url: url.trim(),
            socket: {
              reconnectStrategy: (retries) => {
                // Fail connection attempts fast on startup/failure to prevent hanging the application
                if (retries >= 3) {
                  return new Error('Redis connection failed after 3 attempts');
                }
                return 100; // wait 100ms
              },
            },
          });

          // Prevent process crashes from unhandled client error events
          client.on('error', (err) => {
            console.error('Redis client error event:', err.message || err);
          });

          await client.connect();

          const store = redisInsStore(client, {
            ttl: 3600 * 1000, // 1 hour
          });

          return { store };
        } catch (error) {
          console.error(
            'Redis connection failed, using memory cache:',
            error instanceof Error ? error.message : 'Unknown error',
          );
          if (client) {
            try {
              await client.disconnect();
            } catch (disconnectError) {
              // Ignore disconnection errors during cleanup
            }
          }
          return { store: 'memory' };
        }
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
