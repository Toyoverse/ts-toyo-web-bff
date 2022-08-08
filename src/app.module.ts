import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule, InjectQueue } from '@nestjs/bull';
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
  SaveBoxProducerService,
  SaveBoxConsumer,
  ToyoProducerService,
  ToyoConsumer,
} from './service';
import { Queue } from 'bull';
import { MiddlewareBuilder } from '@nestjs/core';
import { createBullBoard } from 'bull-board';
import { BullAdapter } from 'bull-board/bullAdapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    BullModule.registerQueue({
      name: 'saveBox-queue',
    }),
    BullModule.registerQueue({
      name: 'toyo-queue',
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        maxRetriesPerRequest: null,
      },
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
    SaveBoxProducerService,
    SaveBoxConsumer,
    ToyoProducerService,
    ToyoConsumer,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AppController);
  }
}
