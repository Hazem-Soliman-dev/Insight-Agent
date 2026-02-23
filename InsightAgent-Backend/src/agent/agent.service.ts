import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { SubscriptionService } from '../subscription/subscription.service';
import Groq from 'groq-sdk';

export interface ChartSuggestion {
  type: 'table' | 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  xAxis?: string;
  yAxis?: string;
  title?: string;
}

export interface Recommendation {
  question: string;
  description: string;
  type: 'insight' | 'drill-down' | 'comparison' | 'trend' | 'anomaly';
}

export interface QueryResult {
  sql: string;
  data: Record<string, unknown>[];
  rowCount: number;
  chartSuggestion: ChartSuggestion;
  recommendations: Recommendation[];
  summary: string;
  executionTime: number;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private groq: Groq;

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private subscriptionService: SubscriptionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  /**
   * Build context prompt with all table schemas
   */
  private async buildSchemaContext(projectId: string): Promise<string> {
    const schemas = await this.uploadService.getProjectSchemas(projectId);

    if (schemas.length === 0) {
      throw new BadRequestException(
        'No tables found in this project. Please upload CSV files first.',
      );
    }

    const tableDescriptions = schemas
      .map((schema, idx) => {
        const columnsStr = schema.columns.join(', ');
        return `${idx + 1}. Table '${schema.tableName}' (original file: ${schema.originalName})\n   Columns: ${columnsStr}`;
      })
      .join('\n\n');

    return tableDescriptions;
  }

  /**
   * Detect if user is requesting a specific chart type
   */
  private detectChartRequest(question: string): ChartSuggestion['type'] | null {
    const lower = question.toLowerCase();

    if (lower.includes('bar chart') || lower.includes('bar graph'))
      return 'bar';
    if (lower.includes('pie chart') || lower.includes('pie graph'))
      return 'pie';
    if (
      lower.includes('line chart') ||
      lower.includes('line graph') ||
      lower.includes('trend')
    )
      return 'line';
    if (lower.includes('area chart') || lower.includes('area graph'))
      return 'area';
    if (lower.includes('scatter') || lower.includes('scatter plot'))
      return 'scatter';
    if (
      lower.includes('chart') ||
      lower.includes('graph') ||
      lower.includes('visualize') ||
      lower.includes('plot')
    ) {
      return 'bar'; // Default chart type
    }

    return null;
  }

  /**
   * Generate SQL query using Groq AI
   */
  private async generateSQL(
    question: string,
    schemaContext: string,
  ): Promise<string> {
    const systemPrompt = `You are an expert SQL query generator for PostgreSQL. You help users query their uploaded CSV data.

AVAILABLE TABLES:
${schemaContext}

IMPORTANT RULES:
1. All columns are TEXT type. You MUST use CAST for any numeric operations:
   - For numbers: CAST(column_name AS NUMERIC)
   - For integers: CAST(column_name AS INTEGER)
   - For dates: CAST(column_name AS DATE) or TO_DATE(column_name, 'YYYY-MM-DD')

2. Determine table relationships by column name similarity:
   - Look for columns like 'id', 'user_id', 'customer_id', 'order_id' etc.
   - Join tables using these inferred relationships

3. Use double quotes for table and column names: "table_name"."column_name"

4. Return ONLY the SQL query, no explanations, no markdown, no code blocks.

5. Always limit results to 1000 rows maximum unless the user asks for a specific count.

6. For aggregations, always include meaningful column aliases.

7. If user asks for a chart or visualization, write a query that would produce good chart data:
   - For bar/pie charts: GROUP BY a category and aggregate a numeric value
   - For line charts: Include date/time ordering with aggregations
   - For scatter plots: Select two numeric columns

8. CRITICAL GROUP BY RULE: If you use any aggregation function (COUNT, SUM, AVG, MAX, MIN), you MUST GROUP BY ALL non-aggregated columns in the SELECT clause.
   - WRONG: SELECT category, date, SUM(amount) FROM table GROUP BY category
   - CORRECT: SELECT category, date, SUM(amount) FROM table GROUP BY category, date`;

    const userPrompt = `Generate a PostgreSQL query to answer this question: ${question}

Return ONLY the raw SQL query, nothing else.`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      });

      const sql = completion.choices[0]?.message?.content?.trim();

      if (!sql) {
        throw new Error('No SQL generated');
      }

      // Clean up the SQL (remove markdown code blocks if present)
      return sql
        .replace(/```sql\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();
    } catch (error) {
      this.logger.error('Failed to generate SQL:', error);
      throw new BadRequestException(
        `Failed to generate SQL query: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Attempt to fix invalid SQL based on error message
   */
  private async fixSQL(
    question: string,
    invalidSQL: string,
    errorMessage: string,
  ): Promise<string> {
    this.logger.warn(`Attempting to fix SQL. Error: ${errorMessage}`);

    const systemPrompt = `You are an expert SQL debugger. The user's query failed.
FIX the SQL based on the error message.

Original Question: ${question}
Invalid SQL: ${invalidSQL}
Error Message: ${errorMessage}

RULES:
1. Fix the specific error mentioned (usually GROUP BY or column naming).
2. If "must appear in the GROUP BY clause", add the missing columns to GROUP BY.
3. Return ONLY the corrected SQL query. No markdown, no explanation.`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.1,
      });

      const sql = completion.choices[0]?.message?.content?.trim();
      if (!sql) throw new Error('Failed to fix SQL');

      return sql
        .replace(/```sql\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();
    } catch (e) {
      this.logger.error('Failed to auto-fix SQL', e);
      throw new Error('Could not fix SQL query automatically');
    }
  }

  /**
   * Generate recommendations for next analysis steps
   */
  private async generateRecommendations(
    question: string,
    schemaContext: string,
    data: Record<string, unknown>[],
    sql: string,
  ): Promise<{ recommendations: Recommendation[]; summary: string }> {
    const dataPreview = data
      .slice(0, 5)
      .map((row) => JSON.stringify(row))
      .join('\n');
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    const systemPrompt = `You are a business intelligence analyst. Based on a user's question, the data schema, query results, and executed SQL, provide:
1. A brief 1-2 sentence summary of the results
2. 3-4 recommended follow-up questions for deeper analysis

SCHEMA:
${schemaContext}

EXECUTED SQL:
${sql}

RESULT PREVIEW (first 5 rows):
${dataPreview}

RESULT COLUMNS: ${columns.join(', ')}
TOTAL ROWS: ${data.length}

Respond in this exact JSON format (no markdown, no code blocks):
{
  "summary": "Brief summary of results",
  "recommendations": [
    {"question": "Follow-up question 1", "description": "Why this is valuable", "type": "insight"},
    {"question": "Follow-up question 2", "description": "Why this is valuable", "type": "drill-down"},
    {"question": "Follow-up question 3", "description": "Why this is valuable", "type": "comparison"}
  ]
}

Recommendation types:
- insight: Discover patterns or key metrics
- drill-down: Explore specific segments deeper
- comparison: Compare across categories or time
- trend: Analyze changes over time
- anomaly: Find outliers or unusual patterns`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Original question: ${question}\n\nProvide analysis summary and recommendations.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      });

      const response = completion.choices[0]?.message?.content?.trim();

      if (!response) {
        return {
          summary: `Found ${data.length} results.`,
          recommendations: [],
        };
      }

      // Parse JSON response
      interface RecommendationsResponse {
        summary: string;
        recommendations: Recommendation[];
      }

      const parsed = JSON.parse(
        response
          .replace(/```json\n?/gi, '')
          .replace(/```\n?/g, '')
          .trim(),
      ) as RecommendationsResponse;

      return {
        summary: parsed.summary || `Found ${data.length} results.`,
        recommendations: parsed.recommendations || [],
      };
    } catch (error) {
      this.logger.warn('Failed to generate recommendations:', error);
      return {
        summary: `Found ${data.length} results.`,
        recommendations: [],
      };
    }
  }

  /**
   * Suggest chart type based on query results and user request
   */
  private suggestChart(
    sql: string,
    data: Record<string, unknown>[],
    requestedType: ChartSuggestion['type'] | null,
  ): ChartSuggestion {
    if (data.length === 0) {
      return { type: 'table' };
    }

    const columns = Object.keys(data[0]);
    const sqlLower = sql.toLowerCase();

    // Find numeric and category columns
    const numericColumns: string[] = [];
    const categoryColumns: string[] = [];

    columns.forEach((col) => {
      const value = data[0][col];
      if (
        typeof value === 'number' ||
        (typeof value === 'string' && !isNaN(Number(value)) && value !== '')
      ) {
        numericColumns.push(col);
      } else {
        categoryColumns.push(col);
      }
    });

    // Check for aggregations
    const hasAggregation =
      sqlLower.includes('count(') ||
      sqlLower.includes('sum(') ||
      sqlLower.includes('avg(') ||
      sqlLower.includes('max(') ||
      sqlLower.includes('min(');

    const hasGroupBy = sqlLower.includes('group by');

    // Check for date columns
    const dateColumns = columns.filter(
      (col) =>
        col.toLowerCase().includes('date') ||
        col.toLowerCase().includes('time') ||
        col.toLowerCase().includes('created') ||
        col.toLowerCase().includes('updated') ||
        col.toLowerCase().includes('month') ||
        col.toLowerCase().includes('year'),
    );

    // If user requested specific type, validate and use it
    if (requestedType && requestedType !== 'table') {
      const xAxis = categoryColumns[0] || dateColumns[0] || columns[0];
      const yAxis = numericColumns[0] || columns[1];

      return {
        type: requestedType,
        xAxis,
        yAxis,
        title: this.generateChartTitle(requestedType, xAxis, yAxis),
      };
    }

    // Auto-detect best chart type
    if (hasAggregation && hasGroupBy && columns.length >= 2) {
      const yAxis =
        numericColumns[0] ||
        columns.find((col) => {
          const value = data[0][col];
          return typeof value === 'number' || !isNaN(Number(value));
        });
      const xAxis = categoryColumns[0] || columns.find((col) => col !== yAxis);

      if (dateColumns.length > 0) {
        return {
          type: 'line',
          xAxis: dateColumns[0],
          yAxis,
          title: this.generateChartTitle('line', dateColumns[0], yAxis),
        };
      }

      if (data.length <= 6) {
        return {
          type: 'pie',
          xAxis,
          yAxis,
          title: this.generateChartTitle('pie', xAxis, yAxis),
        };
      }

      return {
        type: 'bar',
        xAxis,
        yAxis,
        title: this.generateChartTitle('bar', xAxis, yAxis),
      };
    }

    // Check for time series
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      return {
        type: 'line',
        xAxis: dateColumns[0],
        yAxis: numericColumns[0],
        title: this.generateChartTitle(
          'line',
          dateColumns[0],
          numericColumns[0],
        ),
      };
    }

    return { type: 'table' };
  }

  /**
   * Generate a descriptive chart title
   */
  private generateChartTitle(
    type: string,
    xAxis?: string,
    yAxis?: string,
  ): string {
    if (!xAxis || !yAxis) return '';

    const cleanX = xAxis.replace(/_/g, ' ').replace(/"/g, '');
    const cleanY = yAxis.replace(/_/g, ' ').replace(/"/g, '');

    switch (type) {
      case 'bar':
        return `${cleanY} by ${cleanX}`;
      case 'pie':
        return `Distribution of ${cleanY} by ${cleanX}`;
      case 'line':
        return `${cleanY} over ${cleanX}`;
      case 'area':
        return `${cleanY} trend over ${cleanX}`;
      case 'scatter':
        return `${cleanY} vs ${cleanX}`;
      default:
        return `${cleanY} by ${cleanX}`;
    }
  }

  /**
   * Execute a natural language query on project data
   */
  async executeQuery(
    projectId: string,
    question: string,
    userId: string,
  ): Promise<QueryResult> {
    const startTime = Date.now();

    // Check query limit before executing
    await this.subscriptionService.checkQueryLimit(userId);

    // Check cache
    const cacheKey = `proj:${projectId}:q:${crypto.createHash('md5').update(question).digest('hex')}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const cachedResult = (await this.cacheManager.get<QueryResult>(
      cacheKey,
    )) as QueryResult | undefined;

    if (cachedResult) {
      this.logger.log(`Cache hit for question: ${question}`);
      // Still increment usage even for cached queries
      await this.subscriptionService.incrementQueryCount(userId);
      return cachedResult;
    }

    // Build schema context
    const schemaContext = await this.buildSchemaContext(projectId);

    this.logger.log(`Generating SQL for question: ${question}`);

    // Detect if user wants a specific chart type
    const requestedChartType = this.detectChartRequest(question);

    // Generate SQL
    const sql = await this.generateSQL(question, schemaContext);

    this.logger.log(`Generated SQL: ${sql}`);

    // Validate SQL (basic safety check)
    const sqlUpper = sql.toUpperCase().trim();
    if (
      sqlUpper.startsWith('DROP') ||
      sqlUpper.startsWith('DELETE') ||
      sqlUpper.startsWith('TRUNCATE') ||
      sqlUpper.startsWith('ALTER') ||
      sqlUpper.startsWith('CREATE') ||
      sqlUpper.startsWith('INSERT') ||
      sqlUpper.startsWith('UPDATE')
    ) {
      throw new BadRequestException(
        'Only SELECT queries are allowed for data analysis.',
      );
    }

    // Execute query with auto-retry
    let data: Record<string, unknown>[] = [];
    let currentSQL = sql;
    let attempts = 0;
    const maxRetries = 1;

    while (attempts <= maxRetries) {
      try {
        data = await this.prisma.$queryRawUnsafe(currentSQL);
        break; // Success
      } catch (error) {
        attempts++;
        if (attempts > maxRetries) {
          const errorMsg =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`SQL execution failed after retries: ${errorMsg}`);
          throw new BadRequestException(
            `Failed to execute query: ${errorMsg}. SQL: ${currentSQL}`,
          );
        }

        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `SQL execution failed (Attempt ${attempts}): ${errorMsg}`,
        );

        try {
          // Attempt to fix the SQL
          currentSQL = await this.fixSQL(question, currentSQL, errorMsg);
          this.logger.log(`Retrying with corrected SQL: ${currentSQL}`);
        } catch {
          // If fixing fails, throw original error
          throw new BadRequestException(
            `Failed to execute query: ${errorMsg}. SQL: ${currentSQL}`,
          );
        }
      }
    }

    // Generate recommendations and summary
    const { recommendations, summary } = await this.generateRecommendations(
      question,
      schemaContext,
      data,
      sql,
    );

    const executionTime = Date.now() - startTime;

    // Suggest chart type
    const chartSuggestion = this.suggestChart(sql, data, requestedChartType);

    const result = {
      sql: currentSQL, // Return the actually executed SQL (it might have been fixed)
      data,
      rowCount: data.length,
      chartSuggestion,
      recommendations,
      summary,
      executionTime,
    };

    // Increment query usage
    await this.subscriptionService.incrementQueryCount(userId);

    // Cache the result (1 hour TTL)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await this.cacheManager.set(cacheKey, result, 3600 * 1000);

    return result;
  }

  /**
   * Get sample data from a specific table
   */
  async previewTable(
    projectId: string,
    tableName: string,
    limit = 10,
  ): Promise<Record<string, unknown>[]> {
    // Verify table belongs to project
    const table = await this.prisma.tableMetadata.findFirst({
      where: { projectId, tableName },
    });

    if (!table) {
      throw new BadRequestException(
        `Table ${tableName} not found in project ${projectId}`,
      );
    }

    const data = await this.prisma.$queryRawUnsafe(
      `SELECT * FROM "${tableName}" LIMIT ${limit}`,
    );

    return data as Record<string, unknown>[];
  }
}
