"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
const subscription_service_1 = require("../subscription/subscription.service");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
let AgentService = AgentService_1 = class AgentService {
    prisma;
    uploadService;
    subscriptionService;
    cacheManager;
    logger = new common_1.Logger(AgentService_1.name);
    groq;
    constructor(prisma, uploadService, subscriptionService, cacheManager) {
        this.prisma = prisma;
        this.uploadService = uploadService;
        this.subscriptionService = subscriptionService;
        this.cacheManager = cacheManager;
        this.groq = new groq_sdk_1.default({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    async buildSchemaContext(projectId) {
        const schemas = await this.uploadService.getProjectSchemas(projectId);
        if (schemas.length === 0) {
            throw new common_1.BadRequestException('No tables found in this project. Please upload CSV files first.');
        }
        const tableDescriptions = schemas
            .map((schema, idx) => {
            const columnsStr = schema.columns.join(', ');
            return `${idx + 1}. Table '${schema.tableName}' (original file: ${schema.originalName})\n   Columns: ${columnsStr}`;
        })
            .join('\n\n');
        return tableDescriptions;
    }
    detectChartRequest(question) {
        const lower = question.toLowerCase();
        if (lower.includes('bar chart') || lower.includes('bar graph'))
            return 'bar';
        if (lower.includes('pie chart') || lower.includes('pie graph'))
            return 'pie';
        if (lower.includes('line chart') ||
            lower.includes('line graph') ||
            lower.includes('trend'))
            return 'line';
        if (lower.includes('area chart') || lower.includes('area graph'))
            return 'area';
        if (lower.includes('scatter') || lower.includes('scatter plot'))
            return 'scatter';
        if (lower.includes('chart') ||
            lower.includes('graph') ||
            lower.includes('visualize') ||
            lower.includes('plot')) {
            return 'bar';
        }
        return null;
    }
    async generateSQL(question, schemaContext) {
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
            return sql
                .replace(/```sql\n?/gi, '')
                .replace(/```\n?/g, '')
                .trim();
        }
        catch (error) {
            this.logger.error('Failed to generate SQL:', error);
            throw new common_1.BadRequestException(`Failed to generate SQL query: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async fixSQL(question, invalidSQL, errorMessage) {
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
            if (!sql)
                throw new Error('Failed to fix SQL');
            return sql
                .replace(/```sql\n?/gi, '')
                .replace(/```\n?/g, '')
                .trim();
        }
        catch (e) {
            this.logger.error('Failed to auto-fix SQL', e);
            throw new Error('Could not fix SQL query automatically');
        }
    }
    async generateRecommendations(question, schemaContext, data, sql) {
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
            const parsed = JSON.parse(response
                .replace(/```json\n?/gi, '')
                .replace(/```\n?/g, '')
                .trim());
            return {
                summary: parsed.summary || `Found ${data.length} results.`,
                recommendations: parsed.recommendations || [],
            };
        }
        catch (error) {
            this.logger.warn('Failed to generate recommendations:', error);
            return {
                summary: `Found ${data.length} results.`,
                recommendations: [],
            };
        }
    }
    suggestChart(sql, data, requestedType) {
        if (data.length === 0) {
            return { type: 'table' };
        }
        const columns = Object.keys(data[0]);
        const sqlLower = sql.toLowerCase();
        const numericColumns = [];
        const categoryColumns = [];
        columns.forEach((col) => {
            const value = data[0][col];
            if (typeof value === 'number' ||
                (typeof value === 'string' && !isNaN(Number(value)) && value !== '')) {
                numericColumns.push(col);
            }
            else {
                categoryColumns.push(col);
            }
        });
        const hasAggregation = sqlLower.includes('count(') ||
            sqlLower.includes('sum(') ||
            sqlLower.includes('avg(') ||
            sqlLower.includes('max(') ||
            sqlLower.includes('min(');
        const hasGroupBy = sqlLower.includes('group by');
        const dateColumns = columns.filter((col) => col.toLowerCase().includes('date') ||
            col.toLowerCase().includes('time') ||
            col.toLowerCase().includes('created') ||
            col.toLowerCase().includes('updated') ||
            col.toLowerCase().includes('month') ||
            col.toLowerCase().includes('year'));
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
        if (hasAggregation && hasGroupBy && columns.length >= 2) {
            const yAxis = numericColumns[0] ||
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
        if (dateColumns.length > 0 && numericColumns.length > 0) {
            return {
                type: 'line',
                xAxis: dateColumns[0],
                yAxis: numericColumns[0],
                title: this.generateChartTitle('line', dateColumns[0], numericColumns[0]),
            };
        }
        return { type: 'table' };
    }
    generateChartTitle(type, xAxis, yAxis) {
        if (!xAxis || !yAxis)
            return '';
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
    async executeQuery(projectId, question, userId) {
        const startTime = Date.now();
        await this.subscriptionService.checkQueryLimit(userId);
        const cacheKey = `proj:${projectId}:q:${crypto.createHash('md5').update(question).digest('hex')}`;
        const cachedResult = (await this.cacheManager.get(cacheKey));
        if (cachedResult) {
            this.logger.log(`Cache hit for question: ${question}`);
            await this.subscriptionService.incrementQueryCount(userId);
            return cachedResult;
        }
        const schemaContext = await this.buildSchemaContext(projectId);
        this.logger.log(`Generating SQL for question: ${question}`);
        const requestedChartType = this.detectChartRequest(question);
        const sql = await this.generateSQL(question, schemaContext);
        this.logger.log(`Generated SQL: ${sql}`);
        const sqlUpper = sql.toUpperCase().trim();
        if (sqlUpper.startsWith('DROP') ||
            sqlUpper.startsWith('DELETE') ||
            sqlUpper.startsWith('TRUNCATE') ||
            sqlUpper.startsWith('ALTER') ||
            sqlUpper.startsWith('CREATE') ||
            sqlUpper.startsWith('INSERT') ||
            sqlUpper.startsWith('UPDATE')) {
            throw new common_1.BadRequestException('Only SELECT queries are allowed for data analysis.');
        }
        let data = [];
        let currentSQL = sql;
        let attempts = 0;
        const maxRetries = 1;
        while (attempts <= maxRetries) {
            try {
                data = await this.prisma.$queryRawUnsafe(currentSQL);
                break;
            }
            catch (error) {
                attempts++;
                if (attempts > maxRetries) {
                    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                    this.logger.error(`SQL execution failed after retries: ${errorMsg}`);
                    throw new common_1.BadRequestException(`Failed to execute query: ${errorMsg}. SQL: ${currentSQL}`);
                }
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                this.logger.warn(`SQL execution failed (Attempt ${attempts}): ${errorMsg}`);
                try {
                    currentSQL = await this.fixSQL(question, currentSQL, errorMsg);
                    this.logger.log(`Retrying with corrected SQL: ${currentSQL}`);
                }
                catch {
                    throw new common_1.BadRequestException(`Failed to execute query: ${errorMsg}. SQL: ${currentSQL}`);
                }
            }
        }
        const { recommendations, summary } = await this.generateRecommendations(question, schemaContext, data, sql);
        const executionTime = Date.now() - startTime;
        const chartSuggestion = this.suggestChart(sql, data, requestedChartType);
        const result = {
            sql: currentSQL,
            data,
            rowCount: data.length,
            chartSuggestion,
            recommendations,
            summary,
            executionTime,
        };
        await this.subscriptionService.incrementQueryCount(userId);
        await this.cacheManager.set(cacheKey, result, 3600 * 1000);
        return result;
    }
    async previewTable(projectId, tableName, limit = 10) {
        const table = await this.prisma.tableMetadata.findFirst({
            where: { projectId, tableName },
        });
        if (!table) {
            throw new common_1.BadRequestException(`Table ${tableName} not found in project ${projectId}`);
        }
        const data = await this.prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}" LIMIT ${limit}`);
        return data;
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService,
        subscription_service_1.SubscriptionService, Object])
], AgentService);
//# sourceMappingURL=agent.service.js.map