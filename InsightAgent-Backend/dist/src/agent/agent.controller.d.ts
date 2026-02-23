import { AgentService } from './agent.service';
import { QueryDto } from './dto';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class AgentController {
    private readonly agentService;
    constructor(agentService: AgentService);
    executeQuery(queryDto: QueryDto, user: JwtPayload): Promise<{
        success: boolean;
        data: import("./agent.service").QueryResult;
    }>;
    previewTable(projectId: string, tableName: string, user: JwtPayload, limit?: string): Promise<{
        success: boolean;
        data: Record<string, unknown>[];
    }>;
}
