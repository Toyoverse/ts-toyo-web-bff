import * as express from 'express';
import * as cors from 'cors';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('Toyoverse BFF')
    .setDescription('The Toyoverse API description')
    .setVersion('1.0.2')
    .addTag('boxes')
    .addTag('toyos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const options: cors.CorsOptions = {
    methods: 'GET,POST,OPTIONS',
    origin: '*',
  };

  app.use(cors(options));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
