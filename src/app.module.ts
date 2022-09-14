import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController, ToyoPersonaController } from './controller';
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
  HashBoxService,
  TrainingService,
} from './service';
import { AESCrypt } from './utils/crypt/aes-crypt';
import di from './di';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
  ],
  controllers: [AppController, ToyoPersonaController],
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
    HashBoxService,
    TrainingService,
    { provide: di.AESCrypt, useClass: AESCrypt },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AppController);
  }
}
