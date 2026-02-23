"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: {
            statusCode: 429,
            message: 'Too many requests, please try again later.',
        },
        standardHeaders: true,
        legacyHeaders: false,
    }));
    app.use((0, compression_1.default)());
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [];
    const isProduction = process.env.NODE_ENV === 'production';
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin && !isProduction) {
                callback(null, true);
                return;
            }
            if (allowedOrigins.includes('*')) {
                callback(null, true);
                return;
            }
            if (origin && allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            if (!isProduction && origin && origin.includes('localhost')) {
                callback(null, true);
                return;
            }
            callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: isProduction,
    }));
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 InsightAgent API running on http://localhost:${port}/api`);
    logger.log(`🔒 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    logger.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ') || 'localhost (dev mode)'}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map