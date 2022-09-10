import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PlayerModel from '../models/Player.model';
import * as Parse from 'parse/node';
import { json } from 'stream/consumers';
import { BoxService } from './box.service';
import { ToyoService } from './toyo.service';
import { PartService } from './part.service';
import BoxModel from 'src/models/Box.model';
import ToyoModel from 'src/models/Toyo.model';
import { response } from 'express';
import PartModel from 'src/models/Part.model';

@Injectable()
export class PlayerService {
  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => BoxService))
    private readonly boxService: BoxService,
    @Inject(forwardRef(() => BoxService))
    private readonly toyoService: ToyoService,
    private readonly partService: PartService,
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

  async getPlayerByWalletAddress(walletAddress: string): Promise<Parse.Object> {
    const Players = Parse.Object.extend('Players');
    const playerQuery = new Parse.Query(Players);
    playerQuery.equalTo('walletAddress', walletAddress);

    try {
      const result = await playerQuery.find();
      return result[0];
    } catch (error) {
      console.log(error);
    }
  }

  async findPlayerByWalletId(
    walletId: string,
    isPost?: boolean,
  ): Promise<PlayerModel> {
    const Players = Parse.Object.extend('Players', PlayerModel);
    const playerQuery = new Parse.Query(Players);
    playerQuery.equalTo('walletAddress', walletId);

    try {
      const result = await playerQuery.find();

      if (result.length < 1 || result[0].get('walletAddress') !== walletId) {
        response.status(404).send({
          erros: ['Player not found!'],
        });
      }
      let player: Promise<PlayerModel>;
      if (isPost) {
        player = this.PlayerMapperWithOutIdCreatedUpdated(result[0]);
      } else {
        player = this.PlayerMapper(result[0]);
      }

      return player;
    } catch (error) {
      response.status(500).send({
        error: [error.message],
      });
    }
  }
  private async PlayerMapper(
    result: Parse.Object<Parse.Attributes>,
  ): Promise<PlayerModel> {
    const player: PlayerModel = new PlayerModel();

    player.id = result.id;
    player.toyos = await this.ToyosMapper(
      await result.relation('toyos').query().find(),
    );
    player.token = result.get('sessionToken');
    player.expiresAt = result.get('sessionTokenExpiresAt');
    player.lastUnboxingFinishedAt = result.get('lastUnboxingFinishedAt');
    player.hasPendingUnboxing = result.get('hasPendingUnboxing');
    player.lastUnboxingStartedAt = result.get('lastUnboxingStartedAt');
    player.wallet = result.get('walletAddress');
    player.boxes = await this.BoxesMapper(
      await result.relation('boxes').query().find(),
    );
    player.toyoParts = await this.PartMapper(
      await result.relation('toyoParts').query().find(),
    );
    player.createdAt = result.get('createdAt');
    player.updatedAt = result.get('updatedAt');

    return player;
  }
  private async PlayerMapperWithOutIdCreatedUpdated(
    result: Parse.Object<Parse.Attributes>,
  ): Promise<PlayerModel> {
    const player: PlayerModel = new PlayerModel();

    player.toyos = await this.ToyosMapper(
      await result.relation('toyos').query().find(),
    );
    player.token = result.get('sessionToken');
    player.lastUnboxingFinishedAt = result.get('lastUnboxingFinishedAt');
    player.hasPendingUnboxing = result.get('hasPendingUnboxing');
    player.lastUnboxingStartedAt = result.get('lastUnboxingStartedAt');
    player.wallet = result.get('walletAddress');
    player.boxes = await this.BoxesMapper(
      await result.relation('boxes').query().find(),
    );
    player.toyoParts = await this.PartMapper(
      await result.relation('toyoParts').query().find(),
    );

    return player;
  }
  private async BoxesMapper(
    result: Parse.Object<Parse.Attributes>[],
  ): Promise<BoxModel[]> {
    const boxes: BoxModel[] = [];

    for (const box of result) {
      boxes.push(await this.boxService.findBoxById(box.id));
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
  private async PartMapper(
    result: Parse.Object<Parse.Attributes>[],
  ): Promise<PartModel[]> {
    const parts: PartModel[] = [];

    for (const box of result) {
      parts.push(await this.partService.findPartById(box.id));
    }
    return parts;
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
