import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {ApiBearerAuth} from "@nestjs/swagger";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiBearerAuth('auth')
  @Get('/test')
  getHello(): string {
    return this.appService.getHello();
  }
}
