import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    // Check if user can create more projects
    await this.subscriptionService.checkProjectLimit(userId);

    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: { tables: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { tables: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    await this.findOne(id, userId); // Ensure project exists and user owns it

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: { tables: true },
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId);

    // Drop all dynamic tables associated with this project
    for (const table of project.tables) {
      try {
        await this.prisma.$executeRawUnsafe(
          `DROP TABLE IF EXISTS "${table.tableName}" CASCADE`,
        );
      } catch (error) {
        console.error(`Failed to drop table ${table.tableName}:`, error);
      }
    }

    // Delete project (cascade will delete TableMetadata entries)
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async getProjectTables(projectId: string, userId: string) {
    const project = await this.findOne(projectId, userId);
    return project.tables;
  }
}
