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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const subscription_service_1 = require("../subscription/subscription.service");
let ProjectsService = class ProjectsService {
    prisma;
    subscriptionService;
    constructor(prisma, subscriptionService) {
        this.prisma = prisma;
        this.subscriptionService = subscriptionService;
    }
    async create(createProjectDto, userId) {
        await this.subscriptionService.checkProjectLimit(userId);
        return this.prisma.project.create({
            data: {
                ...createProjectDto,
                userId,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.project.findMany({
            where: { userId },
            include: { tables: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: { tables: true },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        if (project.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this project');
        }
        return project;
    }
    async update(id, updateProjectDto, userId) {
        await this.findOne(id, userId);
        return this.prisma.project.update({
            where: { id },
            data: updateProjectDto,
            include: { tables: true },
        });
    }
    async remove(id, userId) {
        const project = await this.findOne(id, userId);
        for (const table of project.tables) {
            try {
                await this.prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table.tableName}" CASCADE`);
            }
            catch (error) {
                console.error(`Failed to drop table ${table.tableName}:`, error);
            }
        }
        return this.prisma.project.delete({
            where: { id },
        });
    }
    async getProjectTables(projectId, userId) {
        const project = await this.findOne(projectId, userId);
        return project.tables;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscription_service_1.SubscriptionService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map