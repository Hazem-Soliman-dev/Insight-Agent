import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { SubscriptionService } from '../subscription/subscription.service';
export declare class ProjectsService {
    private prisma;
    private subscriptionService;
    constructor(prisma: PrismaService, subscriptionService: SubscriptionService);
    create(createProjectDto: CreateProjectDto, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findAll(userId: string): Promise<({
        tables: {
            id: string;
            createdAt: Date;
            projectId: string;
            tableName: string;
            originalName: string;
            columns: string[];
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        tables: {
            id: string;
            createdAt: Date;
            projectId: string;
            tableName: string;
            originalName: string;
            columns: string[];
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<{
        tables: {
            id: string;
            createdAt: Date;
            projectId: string;
            tableName: string;
            originalName: string;
            columns: string[];
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    getProjectTables(projectId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        tableName: string;
        originalName: string;
        columns: string[];
    }[]>;
}
