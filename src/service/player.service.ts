import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PlayerModel from '../models/Player.model';
import * as Parse from 'parse/node';
import { json } from 'stream/consumers';
import { BoxService } from './box.service';
import { ToyoService } from './toyo.service';
import BoxModel from 'src/models/Box.model';
import ToyoModel from 'src/models/Toyo.model';

@Injectable()
export class PlayerService {
  constructor(
    private configService: ConfigService,
    private readonly boxService: BoxService,
    private readonly toyoService: ToyoService,
  ) {
    this.ParseServerConfiguration();
  }
  async PlayerMapperEnvironment(
    result: Parse.Object<Parse.Attributes>,
  ): Promise<PlayerModel> {
    const player: PlayerModel = new PlayerModel();

    player.boxes = await this.BoxesMapper(
      await result.relation('boxes').query().find(),
    );
    player.toyos = await this.ToyosMapper(
      await result.relation('toyos').query().find(),
    );
    player.wallet = result.get('walletAddress');

    return player;
  }
  private async BoxesMapper(
    result: Parse.Object<Parse.Attributes>[],
  ): Promise<BoxModel[]> {
    const boxes: BoxModel[] = [];

    for (let index = 0; index < result.length; index++) {
      boxes.push(await this.boxService.findBoxById(result[index].id));
    }

    return boxes;
  }
  private async ToyosMapper(
    result: Parse.Object<Parse.Attributes>[],
  ): Promise<ToyoModel[]> {
    const toyos: ToyoModel[] = [];

    for (let index = 0; index < result.length; index++) {
      toyos.push(await this.toyoService.findToyoById(result[index].id));
    }

    return toyos;
  }

  /**
   * Function to configure ParseSDK
   */
  private ParseServerConfiguration(): void {
    Parse.initialize(
      this.configService.get<string>('BACK4APP_APPLICATION_ID'),
      this.configService.get<string>('BACK4APP_JAVASCRIPT_KEY'),
      this.configService.get<string>('BACK4APP_MASTER_KEY'),
    );
    (Parse as any).serverURL = this.configService.get<string>(
      'BACK4APP_SERVER_URL',
    );
  }
}
