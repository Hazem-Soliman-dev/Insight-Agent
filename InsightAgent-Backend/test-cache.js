const { redisStore } = require('cache-manager-redis-yet');
const cacheManager = require('cache-manager');
require('dotenv').config();

async function run() {
  const url = process.env.REDIS_URL;
  console.log('REDIS_URL:', url ? 'Present' : 'Missing');
  if (!url) return;

  try {
    console.log('Connecting to Redis store...');
    const store = await redisStore({
      url: url.trim(),
      ttl: 3600 * 1000,
    });

    const manager = cacheManager.caching({
      store: store,
    });

    console.log('Setting key test:key...');
    await manager.set('test:key', { ok: true }, 3600 * 1000);
    console.log('Setting successful!');

    console.log('Getting key test:key...');
    const val = await manager.get('test:key');
    console.log('Got value:', val);
  } catch (error) {
    console.error('Cache / Redis error:', error);
  }
}

run();
