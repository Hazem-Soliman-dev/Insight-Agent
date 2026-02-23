"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const projects_service_1 = require("../projects/projects.service");
const subscription_service_1 = require("../subscription/subscription.service");
const sync_1 = require("csv-parse/sync");
let UploadService = UploadService_1 = class UploadService {
    prisma;
    projectsService;
    subscriptionService;
    logger = new common_1.Logger(UploadService_1.name);
    constructor(prisma, projectsService, subscriptionService) {
        this.prisma = prisma;
        this.projectsService = projectsService;
        this.subscriptionService = subscriptionService;
    }
    sanitizeFilename(filename) {
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        const sanitized = nameWithoutExt
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toLowerCase();
        return sanitized.match(/^[0-9]/) ? `t_${sanitized}` : sanitized;
    }
    sanitizeColumnName(columnName) {
        const sanitized = columnName
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toLowerCase()
            .replace(/^[0-9]/, 'c_$&');
        return sanitized || 'column';
    }
    generateTableName(projectId, filename) {
        const sanitizedFilename = this.sanitizeFilename(filename);
        const shortProjectId = projectId.replace(/-/g, '').substring(0, 8);
        return `proj_${shortProjectId}_${sanitizedFilename}`;
    }
    async processCSV(projectId, file, userId) {
        await this.projectsService.findOne(projectId, userId);
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('No file provided');
        }
        const fileSizeMB = file.size / (1024 * 1024);
        await this.subscriptionService.checkFileSizeLimit(userId, fileSizeMB);
        const originalName = file.originalname;
        const tableName = this.generateTableName(projectId, originalName);
        let records;
        try {
            records = (0, sync_1.parse)(file.buffer, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        if (records.length === 0) {
            throw new common_1.BadRequestException('CSV file is empty or has no data rows');
        }
        const rawColumns = Object.keys(records[0]);
        const columns = rawColumns.map((col) => this.sanitizeColumnName(col));
        const columnMapping = new Map();
        rawColumns.forEach((raw, idx) => {
            columnMapping.set(raw, columns[idx]);
        });
        this.logger.log(`Creating table ${tableName} with columns: ${columns.join(', ')}`);
        const columnDefs = columns.map((col) => `"${col}" TEXT`).join(', ');
        const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefs})`;
        try {
            await this.prisma.$executeRawUnsafe(createTableSQL);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create table: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            const values = batch
                .map((record) => {
                const rowValues = rawColumns.map((col) => {
                    const value = record[col] ?? '';
                    return `'${value.replace(/'/g, "''")}'`;
                });
                return `(${rowValues.join(', ')})`;
            })
                .join(', ');
            const insertSQL = `INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES ${values}`;
            try {
                await this.prisma.$executeRawUnsafe(insertSQL);
            }
            catch (error) {
                await this.prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${tableName}"`);
                throw new common_1.BadRequestException(`Failed to insert data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        await this.prisma.tableMetadata.create({
            data: {
                projectId,
                tableName,
                originalName,
                columns,
            },
        });
        this.logger.log(`Successfully created table ${tableName} with ${records.length} rows`);
        await this.createIndexes(tableName, columns);
        return {
            tableName,
            originalName,
            columns,
            rowCount: records.length,
        };
    }
    async getProjectSchemas(projectId) {
        const tables = await this.prisma.tableMetadata.findMany({
            where: { projectId },
            select: {
                tableName: true,
                originalName: true,
                columns: true,
            },
        });
        return tables;
    }
    async deleteTable(projectId, tableName, userId) {
        await this.projectsService.findOne(projectId, userId);
        const table = await this.prisma.tableMetadata.findFirst({
            where: { projectId, tableName },
        });
        if (!table) {
            throw new common_1.BadRequestException(`Table ${tableName} not found in project ${projectId}`);
        }
        await this.prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
        await this.prisma.tableMetadata.delete({
            where: { id: table.id },
        });
    }
    async createIndexes(tableName, columns) {
        for (const col of columns) {
            const lower = col.toLowerCase();
            if (lower === 'id' ||
                lower.endsWith('_id') ||
                lower.endsWith('id') ||
                lower.includes('date') ||
                lower.includes('time') ||
                lower.includes('created') ||
                lower.includes('updated') ||
                lower.includes('email') ||
                lower.includes('status') ||
                lower.includes('category') ||
                lower.includes('type')) {
                try {
                    const indexName = `idx_${tableName}_${col}`;
                    const shortIndexName = indexName.length > 63
                        ? `idx_${tableName.substring(0, 20)}_${col.substring(0, 20)}_${Date.now().toString().substring(9)}`
                        : indexName;
                    await this.prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "${shortIndexName}" ON "${tableName}" ("${col}")`);
                    this.logger.log(`Created index on ${tableName}.${col}`);
                }
                catch (e) {
                    this.logger.warn(`Failed to index ${col}: ${e instanceof Error ? e.message : 'Unknown error'}`);
                }
            }
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        projects_service_1.ProjectsService,
        subscription_service_1.SubscriptionService])
], UploadService);
//# sourceMappingURL=upload.service.js.map