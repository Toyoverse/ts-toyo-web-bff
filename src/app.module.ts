import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controller/app.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { AppService } from './service/app.service';
import { BoxService } from './service/box.service';
import { CardService } from './service/card.service';
import { PartService } from './service/part.service';
import { PlayerService } from './service/player.service';
import { ToyoService } from './service/toyo.service';
import { ToyoPersonaService } from './service/toyoPersona.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PlayerService, 
    ToyoPersonaService, 
    PartService, 
    CardService,
    ToyoService,
    BoxService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(AuthMiddleware)
  .forRoutes(AppController);
  }
}
