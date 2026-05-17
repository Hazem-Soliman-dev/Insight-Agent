import { UploadService } from './upload.service';
import * as client from '@prisma/client';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(file: Express.Multer.File, projectId: string, user: client.User): Promise<{
        success: boolean;
        message: string;
        data: {
            tableName: string;
            originalName: string;
            columns: string[];
            rowCount: number;
        };
    }>;
    deleteTable(projectId: string, tableName: string, user: client.User): Promise<{
        success: boolean;
        message: string;
    }>;
}
