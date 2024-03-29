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
import { IBoxOnChain } from 'src/models/interfaces/IBoxOnChain';
import BoxModel from 'src/models/Box.model';
import { BoxJobProducer } from 'src/jobs/boxJob-producer';
import { valueFromAST } from 'graphql';

@Injectable()
export class EnvironmentService {
  constructor(
    private configService: ConfigService,
    private readonly playerService: PlayerService,
    private readonly onchainService: OnchainService,
    private readonly boxService: BoxService,
    private readonly boxJobProducer: BoxJobProducer,
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
        response.status(404).send({
          erros: ['Player not found!'],
        });
      }

      const player: PlayerModel =
        await this.playerService.PlayerMapperEnvironment(result[0]);

      return player;
    } catch (error) {
      response.status(500).send({
        error: [error.message],
      });
    }
  }

  async findBoxesByWalletId(walletAddress: string) {
    try {
      const boxesOnChain: IBoxOnChain[] =
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

      const boxes = [];
      for (const box of boxesOnChain) {
        const result = boxesOffChain.find((value) => {
          return value.tokenId === box.tokenId && value.typeId === box.typeId;
        });

        if (!result) {
          const boxOff = await this.boxService.saveBox(box);
          if (boxOff) {
            boxes.push({
              boxOff,
              currentOwner: walletAddress,
            });
          }
        } else {
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
      console.log(error);
      response.status(500).send({
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
