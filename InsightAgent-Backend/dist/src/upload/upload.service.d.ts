import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { SubscriptionService } from '../subscription/subscription.service';
export declare class UploadService {
    private prisma;
    private projectsService;
    private subscriptionService;
    private readonly logger;
    constructor(prisma: PrismaService, projectsService: ProjectsService, subscriptionService: SubscriptionService);
    private sanitizeFilename;
    private sanitizeColumnName;
    private generateTableName;
    processCSV(projectId: string, file: Express.Multer.File, userId: string): Promise<{
        tableName: string;
        originalName: string;
        columns: string[];
        rowCount: number;
    }>;
    getProjectSchemas(projectId: string): Promise<Array<{
        tableName: string;
        originalName: string;
        columns: string[];
    }>>;
    deleteTable(projectId: string, tableName: string, userId: string): Promise<void>;
    private createIndexes;
}
