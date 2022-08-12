import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controller/app.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import {
  EnvironmentService,
  BoxService,
  CardService,
  PartService,
  PlayerService,
  ToyoService,
  ToyoPersonaService,
  OnchainService,
  ToyoRegionService,
  BoxJobConsumer,
  BoxJobProducer,
  ToyoJobConsumer,
  ToyoJobProducer,
} from './service';
import { Queue } from 'bull';
import { MiddlewareBuilder } from '@nestjs/core';
import * as qjobs from 'qjobs'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    BoxService,
    EnvironmentService,
    PlayerService,
    ToyoPersonaService,
    PartService,
    OnchainService,
    CardService,
    ToyoService,
    ToyoRegionService,
    BoxJobProducer,
    BoxJobConsumer,
    ToyoJobProducer,
    ToyoJobConsumer,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AppController);
  }
}
