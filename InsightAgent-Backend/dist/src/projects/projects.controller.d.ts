import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import * as client from '@prisma/client';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, user: client.User): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findAll(user: client.User): Promise<({
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
    findOne(id: string, user: client.User): Promise<{
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
    getProjectTables(id: string, user: client.User): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        tableName: string;
        originalName: string;
        columns: string[];
    }[]>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: client.User): Promise<{
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
    remove(id: string, user: client.User): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
