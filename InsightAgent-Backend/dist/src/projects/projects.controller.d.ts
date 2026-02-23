import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, user: JwtPayload): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findAll(user: JwtPayload): Promise<({
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
    findOne(id: string, user: JwtPayload): Promise<{
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
    getProjectTables(id: string, user: JwtPayload): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        tableName: string;
        originalName: string;
        columns: string[];
    }[]>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: JwtPayload): Promise<{
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
    remove(id: string, user: JwtPayload): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
