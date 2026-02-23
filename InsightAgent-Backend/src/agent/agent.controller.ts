import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { QueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@Controller('agent')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('query')
  async executeQuery(
    @Body() queryDto: QueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.agentService.executeQuery(
      queryDto.projectId,
      queryDto.question,
      user.id,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('preview/:projectId/:tableName')
  async previewTable(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
  ) {
    const data = await this.agentService.previewTable(
      projectId,
      tableName,
      limit ? parseInt(limit, 10) : 10,
    );

    return {
      success: true,
      data,
    };
  }
}
