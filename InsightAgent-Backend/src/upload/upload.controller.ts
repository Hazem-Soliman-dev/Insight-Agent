import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!projectId) {
      throw new BadRequestException('projectId is required');
    }

    // Validate file is CSV by extension
    const originalName = file.originalname.toLowerCase();
    if (!originalName.endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are allowed');
    }

    const result = await this.uploadService.processCSV(
      projectId,
      file,
      user.id,
    );

    return {
      success: true,
      message: `Successfully uploaded ${result.originalName}`,
      data: result,
    };
  }

  @Delete(':projectId/:tableName')
  async deleteTable(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.uploadService.deleteTable(projectId, tableName, user.id);
    return {
      success: true,
      message: `Successfully deleted table ${tableName}`,
    };
  }
}
