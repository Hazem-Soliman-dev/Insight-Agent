import { UploadService } from './upload.service';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(file: Express.Multer.File, projectId: string, user: JwtPayload): Promise<{
        success: boolean;
        message: string;
        data: {
            tableName: string;
            originalName: string;
            columns: string[];
            rowCount: number;
        };
    }>;
    deleteTable(projectId: string, tableName: string, user: JwtPayload): Promise<{
        success: boolean;
        message: string;
    }>;
}
