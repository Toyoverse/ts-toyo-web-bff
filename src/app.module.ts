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
} from './service';
import { SaveBoxConsumer } from './jobs/saveBob-cosumer';
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
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AppController);
  }
}
