import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, SubscriptionModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
