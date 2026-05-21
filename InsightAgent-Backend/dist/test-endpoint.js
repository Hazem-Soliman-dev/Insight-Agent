"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("./src/app.module");
const jwt_auth_guard_1 = require("./src/auth/guards/jwt-auth.guard");
const cache_manager_1 = require("@nestjs/cache-manager");
async function run() {
    const moduleFixture = await testing_1.Test.createTestingModule({
        imports: [app_module_1.AppModule],
    })
        .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
        .useValue({
        canActivate: (context) => {
            const req = context.switchToHttp().getRequest();
            req.user = {
                id: '7cbe626d-eab2-4946-8693-2df634edfeaf',
                clerkUserId: 'user_3DpSd5tDVlpXsZEGOLEFq9cqod2',
                email: 'hazem.soliman.dev@gmail.com',
                name: 'Hazem',
                role: 'ADMIN',
                creditsBalance: 30,
            };
            return true;
        },
    })
        .overrideProvider(cache_manager_1.CACHE_MANAGER)
        .useValue({
        get: async () => {
            throw new Error('Redis connection lost (Simulated cache failure)');
        },
        set: async () => {
            throw new Error('Redis connection lost (Simulated cache failure)');
        },
    })
        .compile();
    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    console.log('Sending request to /api/agent/query...');
    try {
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post('/api/agent/query')
            .send({
            projectId: 'e13f9057-01b7-49c0-9310-0797fdc6861d',
            question: 'Show total sales amount',
        });
        console.log('Response Status:', response.status);
        console.log('Response Body:', JSON.stringify(response.body, null, 2));
    }
    catch (error) {
        console.error('Supertest error:', error);
    }
    finally {
        await app.close();
    }
}
run();
//# sourceMappingURL=test-endpoint.js.map