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
} from './service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
  ],
  controllers: [AppController, ToyoPersonaController],
  providers: [
    EnvironmentService,
    PlayerService,
    ToyoPersonaService,
    PartService,
    OnchainService,
    CardService,
    ToyoService,
    BoxService,
    ToyoRegionService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AppController);
  }
}
