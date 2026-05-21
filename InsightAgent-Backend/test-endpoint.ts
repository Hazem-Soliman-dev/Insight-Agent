import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './src/app.module';
import { JwtAuthGuard } from './src/auth/guards/jwt-auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

async function run() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (context: any) => {
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
    .overrideProvider(CACHE_MANAGER)
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
    const response = await request(app.getHttpServer())
      .post('/api/agent/query')
      .send({
        projectId: 'e13f9057-01b7-49c0-9310-0797fdc6861d',
        question: 'Show total sales amount',
      });

    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.error('Supertest error:', error);
  } finally {
    await app.close();
  }
}

run();
