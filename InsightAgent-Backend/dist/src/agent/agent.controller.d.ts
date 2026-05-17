import { AgentService } from './agent.service';
import { QueryDto } from './dto';
import * as client from '@prisma/client';
export declare class AgentController {
    private readonly agentService;
    constructor(agentService: AgentService);
    executeQuery(queryDto: QueryDto, user: client.User): Promise<{
        success: boolean;
        data: import("./agent.service").QueryResult;
    }>;
    previewTable(projectId: string, tableName: string, user: client.User, limit?: string): Promise<{
        success: boolean;
        data: Record<string, unknown>[];
    }>;
}
