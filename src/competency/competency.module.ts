import { Module } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { CompetencyController } from './competency.controller';
import { CompetencyService } from './competency.service';

@Module({
  controllers: [CompetencyController],
  providers: [CompetencyService, PrismaService],
  exports: [CompetencyService],
})
export class CompetencyModule {}
