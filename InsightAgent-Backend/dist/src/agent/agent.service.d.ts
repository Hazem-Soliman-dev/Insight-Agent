import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { SubscriptionService } from '../subscription/subscription.service';
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
export declare class AgentService {
    private prisma;
    private uploadService;
    private subscriptionService;
    private cacheManager;
    private readonly logger;
    private groq;
    constructor(prisma: PrismaService, uploadService: UploadService, subscriptionService: SubscriptionService, cacheManager: Cache);
    private buildSchemaContext;
    private detectChartRequest;
    private generateSQL;
    private fixSQL;
    private generateRecommendations;
    private suggestChart;
    private generateChartTitle;
    executeQuery(projectId: string, question: string, userId: string): Promise<QueryResult>;
    previewTable(projectId: string, tableName: string, limit?: number): Promise<Record<string, unknown>[]>;
}
