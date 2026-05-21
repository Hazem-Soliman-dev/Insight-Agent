const { PrismaClient } = require('@prisma/client');
const { redisStore } = require('cache-manager-redis-yet');
const cacheManager = require('cache-manager');
const Groq = require('groq-sdk');
require('dotenv').config();

// Re-create the logic of AgentService in a script to see exactly where it fails.
class MockSubscriptionService {
  async checkQueryLimit(userId) {
    console.log('checkQueryLimit called for:', userId);
  }
  async incrementQueryCount(userId) {
    console.log('incrementQueryCount called for:', userId);
  }
}

class MockUploadService {
  constructor(prisma) {
    this.prisma = prisma;
  }
  async getProjectSchemas(projectId) {
    return this.prisma.tableMetadata.findMany({
      where: { projectId },
      select: {
        tableName: true,
        originalName: true,
        columns: true,
      },
    });
  }
}

const prisma = new PrismaClient();

async function run() {
  const projectId = 'e13f9057-01b7-49c0-9310-0797fdc6861d';
  const userId = '7cbe626d-eab2-4946-8693-2df634edfeaf';
  const question = 'Show total sales amount';

  // Initialize Cache
  let manager;
  try {
    const url = process.env.REDIS_URL;
    if (url) {
      const store = await redisStore({
        url: url.trim(),
        ttl: 3600 * 1000,
      });
      manager = cacheManager.caching({ store });
    } else {
      manager = cacheManager.caching({ store: 'memory', ttl: 3600 * 1000 });
    }
  } catch (error) {
    console.log('Cache init error (fallback to memory):', error.message);
    manager = cacheManager.caching({ store: 'memory', ttl: 3600 * 1000 });
  }

  // Define executeQuery logic
  try {
    console.log('Starting executeQuery simulation...');
    
    // 1. Check query limit
    const subService = new MockSubscriptionService();
    await subService.checkQueryLimit(userId);

    // 2. Check Cache
    const crypto = require('crypto');
    const cacheKey = `proj:${projectId}:q:${crypto.createHash('md5').update(question).digest('hex')}`;
    
    console.log('Checking cache...');
    const cachedResult = await manager.get(cacheKey);
    console.log('Cached result:', cachedResult);

    // 3. Build schema context
    const uploadService = new MockUploadService(prisma);
    const schemas = await uploadService.getProjectSchemas(projectId);
    console.log('Schemas:', schemas);
    if (schemas.length === 0) {
      throw new Error('No tables found');
    }
    const schemaContext = schemas
      .map((schema, idx) => {
        const columnsStr = schema.columns.join(', ');
        return `${idx + 1}. Table '${schema.tableName}' (original file: ${schema.originalName})\n   Columns: ${columnsStr}`;
      })
      .join('\n\n');

    // 4. Groq SQL Gen
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log('Generating SQL...');
    const systemPrompt = `You are an expert SQL query generator for PostgreSQL. You help users query their uploaded CSV data.
AVAILABLE TABLES:
${schemaContext}
RULES:
1. Columns are TEXT. Cast them.
2. Return ONLY raw SQL query. No markdown.`;
    
    const userPrompt = `Generate a PostgreSQL query to answer this question: ${question}`;
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });
    let sql = completion.choices[0]?.message?.content?.trim();
    sql = sql.replace(/```sql\n?/gi, '').replace(/```\n?/g, '').trim();
    console.log('Generated SQL:', sql);

    // 5. Run query
    console.log('Running query on Postgres...');
    const data = await prisma.$queryRawUnsafe(sql);
    console.log('Query raw data length:', data.length);

    // 6. Generate Recommendations
    console.log('Generating recommendations...');
    const dataPreview = data.slice(0, 5).map((row) => JSON.stringify(row)).join('\n');
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const recSystemPrompt = `You are a business intelligence analyst. Based on a user's question, the data schema, query results, and executed SQL, provide:
1. A brief 1-2 sentence summary of the results
2. 3-4 recommended follow-up questions for deeper analysis

Respond in this exact JSON format:
{
  "summary": "Brief summary of results",
  "recommendations": [
    {"question": "Follow-up question 1", "description": "Why this is valuable", "type": "insight"}
  ]
}`;
    const recCompletion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: recSystemPrompt },
        { role: 'user', content: `Original question: ${question}` },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });
    console.log('Recommendations output:', recCompletion.choices[0]?.message?.content);

    // 7. Write Cache
    console.log('Writing to cache...');
    const result = { ok: true };
    await manager.set(cacheKey, result, 3600 * 1000);
    console.log('Cached successfully!');

  } catch (error) {
    console.error('Error occurred in executeQuery simulation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
