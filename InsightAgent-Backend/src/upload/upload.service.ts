import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { parse } from 'csv-parse/sync';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private subscriptionService: SubscriptionService,
  ) {}

  /**
   * Sanitize filename to create a valid SQL table name component
   */
  private sanitizeFilename(filename: string): string {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    // Replace non-alphanumeric characters with underscores
    const sanitized = nameWithoutExt
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    // Ensure it doesn't start with a number
    return sanitized.match(/^[0-9]/) ? `t_${sanitized}` : sanitized;
  }

  /**
   * Sanitize column name to be a valid SQL identifier
   */
  private sanitizeColumnName(columnName: string): string {
    const sanitized = columnName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
      .replace(/^[0-9]/, 'c_$&');
    return sanitized || 'column';
  }

  /**
   * Generate a unique table name for a project
   */
  private generateTableName(projectId: string, filename: string): string {
    const sanitizedFilename = this.sanitizeFilename(filename);
    // Use first 8 chars of project ID to keep table name reasonable
    const shortProjectId = projectId.replace(/-/g, '').substring(0, 8);
    return `proj_${shortProjectId}_${sanitizedFilename}`;
  }

  /**
   * Process CSV file and create dynamic table
   */
  async processCSV(
    projectId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{
    tableName: string;
    originalName: string;
    columns: string[];
    rowCount: number;
  }> {
    // Verify project exists and user owns it
    await this.projectsService.findOne(projectId, userId);

    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    // Check file size limit
    const fileSizeMB = file.size / (1024 * 1024);
    await this.subscriptionService.checkFileSizeLimit(userId, fileSizeMB);

    const originalName = file.originalname;
    const tableName = this.generateTableName(projectId, originalName);

    // Parse CSV
    let records: Record<string, string>[];
    try {
      records = parse(file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    if (records.length === 0) {
      throw new BadRequestException('CSV file is empty or has no data rows');
    }

    // Extract and sanitize column names
    const rawColumns = Object.keys(records[0]);
    const columns = rawColumns.map((col) => this.sanitizeColumnName(col));

    // Create column name mapping for data insertion
    const columnMapping = new Map<string, string>();
    rawColumns.forEach((raw, idx) => {
      columnMapping.set(raw, columns[idx]);
    });

    this.logger.log(
      `Creating table ${tableName} with columns: ${columns.join(', ')}`,
    );

    // Create table with all TEXT columns
    const columnDefs = columns.map((col) => `"${col}" TEXT`).join(', ');
    const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefs})`;

    try {
      await this.prisma.$executeRawUnsafe(createTableSQL);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create table: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Insert data in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const values = batch
        .map((record) => {
          const rowValues = rawColumns.map((col) => {
            const value = record[col] ?? '';
            // Escape single quotes
            return `'${value.replace(/'/g, "''")}'`;
          });
          return `(${rowValues.join(', ')})`;
        })
        .join(', ');

      const insertSQL = `INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES ${values}`;

      try {
        await this.prisma.$executeRawUnsafe(insertSQL);
      } catch (error) {
        // Clean up table on error
        await this.prisma.$executeRawUnsafe(
          `DROP TABLE IF EXISTS "${tableName}"`,
        );
        throw new BadRequestException(
          `Failed to insert data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Save table metadata
    await this.prisma.tableMetadata.create({
      data: {
        projectId,
        tableName,
        originalName,
        columns,
      },
    });

    this.logger.log(
      `Successfully created table ${tableName} with ${records.length} rows`,
    );

    // Auto-index common columns
    await this.createIndexes(tableName, columns);

    return {
      tableName,
      originalName,
      columns,
      rowCount: records.length,
    };
  }

  /**
   * Get schema information for all tables in a project
   */
  async getProjectSchemas(projectId: string): Promise<
    Array<{
      tableName: string;
      originalName: string;
      columns: string[];
    }>
  > {
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

  /**
   * Delete a specific table from a project
   */
  async deleteTable(
    projectId: string,
    tableName: string,
    userId: string,
  ): Promise<void> {
    // Verify project ownership
    await this.projectsService.findOne(projectId, userId);

    // Verify table exists in project
    const table = await this.prisma.tableMetadata.findFirst({
      where: { projectId, tableName },
    });

    if (!table) {
      throw new BadRequestException(
        `Table ${tableName} not found in project ${projectId}`,
      );
    }

    // Drop the actual table
    await this.prisma.$executeRawUnsafe(
      `DROP TABLE IF EXISTS "${tableName}" CASCADE`,
    );

    // Remove metadata
    await this.prisma.tableMetadata.delete({
      where: { id: table.id },
    });
  }

  /**
   * Automatically create indexes for potentially queriable columns
   */
  private async createIndexes(
    tableName: string,
    columns: string[],
  ): Promise<void> {
    for (const col of columns) {
      const lower = col.toLowerCase();
      // Index ID-like columns (foreign keys, primary keys) calls
      // Index Date-like columns and common filters
      if (
        lower === 'id' ||
        lower.endsWith('_id') ||
        lower.endsWith('id') ||
        lower.includes('date') ||
        lower.includes('time') ||
        lower.includes('created') ||
        lower.includes('updated') ||
        lower.includes('email') ||
        lower.includes('status') ||
        lower.includes('category') ||
        lower.includes('type')
      ) {
        try {
          const indexName = `idx_${tableName}_${col}`;
          // Limit index name length to 63 chars for Postgres
          const shortIndexName =
            indexName.length > 63
              ? `idx_${tableName.substring(0, 20)}_${col.substring(0, 20)}_${Date.now().toString().substring(9)}`
              : indexName;

          await this.prisma.$executeRawUnsafe(
            `CREATE INDEX IF NOT EXISTS "${shortIndexName}" ON "${tableName}" ("${col}")`,
          );
          this.logger.log(`Created index on ${tableName}.${col}`);
        } catch (e) {
          this.logger.warn(
            `Failed to index ${col}: ${e instanceof Error ? e.message : 'Unknown error'}`,
          );
        }
      }
    }
  }
}
