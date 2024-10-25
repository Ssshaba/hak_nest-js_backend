import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {ValidationPipe} from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const port = process.env.PORT!;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
      new ValidationPipe({ skipNullProperties: true, whitelist: true }),
  );

  const config = new DocumentBuilder()
      .setTitle('Platform')
      .setDescription('Platform API description')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'Bearer', in: 'header' }, 'auth')
      .addTag('Platform')
      .build();


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
}
bootstrap();
