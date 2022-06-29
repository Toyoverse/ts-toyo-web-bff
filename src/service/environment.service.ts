import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Parse from 'parse/node';
import { response } from 'express';
import PlayerModel from 'src/models/Player.model';
import { PlayerService } from './player.service';
import { OnchainService } from './onchain.service';
import { TypeId } from 'src/enums/SmartContracts';
import { BoxService } from './box.service';
import { json } from 'stream/consumers';

@Injectable()
export class EnvironmentService {
  constructor(
    private configService: ConfigService,
    private readonly playerService: PlayerService,
    private readonly onchainService: OnchainService,
    private readonly boxService: BoxService,
  ) {
    this.ParseServerConfiguration();
  }
  async findPlayerEnvironmentByWalletId(
    walletId: string,
  ): Promise<PlayerModel> {
    const Players = Parse.Object.extend('Players', PlayerModel);
    const playerQuery = new Parse.Query(Players);
    playerQuery.equalTo('walletAddress', walletId);

    try {
      const result = await playerQuery.find();

      if (result.length < 1 || result[0].get('walletAddress') !== walletId) {
        response.status(404).json({
          erros: ['Player not found!'],
        });
      }

      const player: PlayerModel =
        await this.playerService.PlayerMapperEnvironment(result[0]);

      return player;
    } catch (error) {
      response.status(500).json({
        error: [error.message],
      });
    }
  }

  async findBoxesByWalletId(walletAddress: string) {
    try {
    const boxesOnChain =
      await this.onchainService.getTokenOwnerEntityByWalletAndTypeId(
        walletAddress,
        [
          TypeId.OPEN_FORTIFIED_JAKANA_SEED_BOX,
          TypeId.OPEN_FORTIFIED_KYTUNT_SEED_BOX,
          TypeId.OPEN_JAKANA_SEED_BOX,
          TypeId.OPEN_KYTUNT_SEED_BOX,
          TypeId.TOYO_FORTIFIED_JAKANA_SEED_BOX,
          TypeId.TOYO_FORTIFIED_KYTUNT_SEED_BOX,
          TypeId.TOYO_KYTUNT_SEED_BOX,
          TypeId.TOYO_JAKANA_SEED_BOX,
        ],
      );
    const boxesOffChain = await this.boxService.getBoxesByWalletId(
      walletAddress,
    );

    // TODO Depois...
    // if (boxesOnChain.length !== boxesOffChain.length) {
    //   //precisa rodar background job para atualizar dados
    // }
  
    const boxes = []

    for (const box of boxesOnChain){
      let result = boxesOffChain.find(value => value.tokenId === box.tokenId);

      if (!result){
        boxes.push({
          ...box,
          isOpen: this.isOpen(box.typeId), 
          idOpenBox: null,
          idClosedBox: null,
          lastUnboxingStarted: null,
          modifiers: this.getModifiers(box.typeId),
          type: this.getType(box.typeId),
          region: this.getRegion(box.typeId).name
        });
      }
      else {
        boxes.push({
          ...result,
          currentOwner: walletAddress,
        });
      }
    }

    return {
      wallet: walletAddress,
      boxes: boxes,
    };
  } catch (error) {
    response.status(500).json({
      error: [error.message],
    });
  }
  }
  private isOpen(box: any): boolean{
    return box == TypeId.OPEN_FORTIFIED_JAKANA_SEED_BOX ||
            box == TypeId.OPEN_FORTIFIED_KYTUNT_SEED_BOX ||
            box == TypeId.OPEN_JAKANA_SEED_BOX ||
            box == TypeId.OPEN_KYTUNT_SEED_BOX;
  }
  private getType(type) :string{
    if (type == TypeId.OPEN_FORTIFIED_JAKANA_SEED_BOX || 
      type == TypeId.OPEN_FORTIFIED_KYTUNT_SEED_BOX ||
      type == TypeId.TOYO_FORTIFIED_JAKANA_SEED_BOX ||
      type == TypeId.TOYO_FORTIFIED_KYTUNT_SEED_BOX){
        return 'FORTIFIED';
    }else if (type == TypeId.OPEN_JAKANA_SEED_BOX ||
              type == TypeId.OPEN_KYTUNT_SEED_BOX ||
              type == TypeId.TOYO_JAKANA_SEED_BOX ||
              type== TypeId.TOYO_KYTUNT_SEED_BOX){
      return 'SIMPLE';        
    }
    return undefined;
  }

  private getModifiers(type){
    const key: number = parseInt(type, 10);
    switch (key) {
      case TypeId.TOYO_FORTIFIED_JAKANA_SEED_BOX && TypeId.OPEN_FORTIFIED_JAKANA_SEED_BOX:
        return [{
          name: "Fortified",
          type: "1",
          description: "Increases minimum rarity to be 3 or higher.",
          modification: "1"
        },
        {
          name: "Jakana",
          type: "4",
          description: "Contain only Classic Jakana Toyoparts.",
          modification: {
            "theme": "Classic",
            "region": "Jakana"
          }
        }]
        break;
      case TypeId.TOYO_JAKANA_SEED_BOX && TypeId.OPEN_JAKANA_SEED_BOX:
        return [
          {
            "name": "Jakana",
            "type": "4",
            "description": "Contain only Classic Jakana Toyoparts.",
            "modification": {
              "theme": "Classic",
              "region": "Jakana"
            }
          }
        ]
        break;
      case TypeId.TOYO_FORTIFIED_KYTUNT_SEED_BOX && TypeId.OPEN_FORTIFIED_KYTUNT_SEED_BOX:
        return[
          {
            "name": "Fortified",
            "type": "1",
            "description": "Increases minimum rarity to be 3 or higher.",
            "modification": "1"
          },
          {
            "name": "Kytunt",
            "type": "4",
            "description": "Contain only Classic Kytunt Toyoparts.",
            "restrictions": "Available only until 2022-12-31",
            "modification": {
              "theme": "Classic",
              "region": "Kytunt"
            }
          }
        ]
        break;
      case TypeId.TOYO_KYTUNT_SEED_BOX && TypeId.OPEN_KYTUNT_SEED_BOX:
        return[
          {
            "name": "Kytunt",
            "type": "4",
            "description": "Contain only Classic Kytunt Toyoparts.",
            "restrictions": "Available only until 2022-12-31",
            "modification": {
              "theme": "Classic",
              "region": "Kytunt"
            }
          }
        ]
        break;
      default:
        return undefined;
        break;
    }
  }
  private getRegion(type){
    if (type == TypeId.OPEN_FORTIFIED_JAKANA_SEED_BOX || 
      type == TypeId.OPEN_JAKANA_SEED_BOX ||
      type == TypeId.TOYO_FORTIFIED_JAKANA_SEED_BOX ||
      type == TypeId.TOYO_JAKANA_SEED_BOX){
        return {
          "name": "JAKANA",
          "createdAt": undefined,
          "updatedAt": undefined
      };
    }else if (type == TypeId.OPEN_FORTIFIED_KYTUNT_SEED_BOX ||
              type == TypeId.OPEN_KYTUNT_SEED_BOX ||
              type == TypeId.TOYO_FORTIFIED_KYTUNT_SEED_BOX ||
              type== TypeId.TOYO_KYTUNT_SEED_BOX){
      return {
        "name": "KYTUNT",
        "createdAt": undefined,
        "updatedAt": undefined
      }        
    }
    
    return undefined;
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
