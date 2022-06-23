import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Parse from 'parse/node';
import { response } from 'express';
import PlayerModel from 'src/models/Player.model';
import { PlayerService } from './player.service';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService, 
    private readonly playerService: PlayerService) {
    this.ParseServerConfiguration();
  }
  async findPlayerEnverinmentByWalletId(walletId: string): Promise<PlayerModel> {
    const Players = Parse.Object.extend("Players", PlayerModel);
    const playerQuery = new Parse.Query(Players);
    playerQuery.equalTo('walletAddress', walletId);

    try{
      const result = await playerQuery.find();

      if (result.length < 1 || result[0].get('walletAddress') !== walletId){
        response.status(404).json({
          erros: ['Player not found!'],
        });
      }

      const player: PlayerModel = await this.playerService.PlayerMapperEnvironment(result[0]);

      return player;

    }catch(error){
      response.status(500).json({
        error: [error.message],
      });
    }
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
