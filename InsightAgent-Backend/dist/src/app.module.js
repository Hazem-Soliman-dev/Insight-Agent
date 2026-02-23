"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const prisma_module_1 = require("./prisma/prisma.module");
const projects_module_1 = require("./projects/projects.module");
const upload_module_1 = require("./upload/upload.module");
const agent_module_1 = require("./agent/agent.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const subscription_module_1 = require("./subscription/subscription.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            subscription_module_1.SubscriptionModule,
            projects_module_1.ProjectsModule,
            upload_module_1.UploadModule,
            agent_module_1.AgentModule,
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async () => {
                    try {
                        const url = process.env.REDIS_URL;
                        if (!url) {
                            console.warn('REDIS_URL not set, using memory cache with 1h TTL');
                            return { store: 'memory', ttl: 3600 * 1000 };
                        }
                        const store = await (0, cache_manager_redis_yet_1.redisStore)({
                            url: url.trim(),
                            ttl: 3600 * 1000,
                        });
                        return { store };
                    }
                    catch (error) {
                        console.error('Redis connection failed, using memory cache:', error instanceof Error ? error.message : 'Unknown error');
                        return { store: 'memory' };
                    }
                },
            }),
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map