import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {UserModule} from "../user/user.module";
import {AuthModule} from "../auth/auth.module";
import {ConfigModule} from "@nestjs/config";
import config from 'src/config/config';
import {CompetencyModule} from "../competency/competency.module";
import {getMailConfig} from "../config/mail.config";
import {MailerModule} from "@nestjs-modules/mailer";
import {ProjectModule} from "../project/project.module";
import {TaskModule} from "../task/task.module";


@Module({
  imports: [
    UserModule,
    AuthModule,
    CompetencyModule,
    ProjectModule,
    TaskModule,
    CompetencyModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MailerModule.forRootAsync({
      useFactory: getMailConfig,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
