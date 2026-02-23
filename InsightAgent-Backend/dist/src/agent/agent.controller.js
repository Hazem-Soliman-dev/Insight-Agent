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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("./agent.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let AgentController = class AgentController {
    agentService;
    constructor(agentService) {
        this.agentService = agentService;
    }
    async executeQuery(queryDto, user) {
        const result = await this.agentService.executeQuery(queryDto.projectId, queryDto.question, user.id);
        return {
            success: true,
            data: result,
        };
    }
    async previewTable(projectId, tableName, user, limit) {
        const data = await this.agentService.previewTable(projectId, tableName, limit ? parseInt(limit, 10) : 10);
        return {
            success: true,
            data,
        };
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Post)('query'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryDto, Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "executeQuery", null);
__decorate([
    (0, common_1.Get)('preview/:projectId/:tableName'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('tableName')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "previewTable", null);
exports.AgentController = AgentController = __decorate([
    (0, common_1.Controller)('agent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
//# sourceMappingURL=agent.controller.js.map