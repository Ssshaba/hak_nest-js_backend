import { Module } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CompetencyService } from 'src/competency/competency.service';

@Module({
  providers: [UserService, PrismaService, CompetencyService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
