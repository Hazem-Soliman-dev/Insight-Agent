import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AgentService } from '../src/agent/agent.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const agentService = app.get(AgentService);
  // cacheManager is unused
  // const cacheManager = app.get(CACHE_MANAGER);

  const projectId = 'test-project-id';
  const question = 'What is the total revenue?';

  console.log('--- Initial Query (Should hit DB/AI) ---');
  const start1 = Date.now();
  const testUserId = 'test-user-id'; // Mock user ID for testing
  try {
    // Note: This will likely fail if no tables exist, but we want to check if it ATTEMPTS to cache
    await agentService.executeQuery(projectId, question, testUserId);
  } catch (e) {
    console.log(
      'Expected error or failure (no data):',
      e instanceof Error ? e.message : String(e),
    );
  }
  const duration1 = Date.now() - start1;
  console.log(`Initial call took: ${duration1}ms`);

  console.log('\n--- Second Query (Should hit Cache) ---');
  const start2 = Date.now();
  try {
    const result = await agentService.executeQuery(
      projectId,
      question,
      testUserId,
    );
    console.log('Result from cache:', !!result);
  } catch (e) {
    console.log(
      'Second call error:',
      e instanceof Error ? e.message : String(e),
    );
  }
  const duration2 = Date.now() - start2;
  console.log(`Second call took: ${duration2}ms`);

  if (duration2 < duration1) {
    console.log('\n✅ Cache verified: Second call was faster!');
  } else {
    console.log('\n❌ Cache verification failed: Second call was not faster.');
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
