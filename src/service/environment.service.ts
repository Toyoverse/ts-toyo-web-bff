import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Parse from 'parse/node';
import { response } from 'express';
import PlayerModel from 'src/models/Player.model';
import { PlayerService } from './player.service';
import { OnchainService } from './onchain.service';
import { TypeId } from 'src/enums/SmartContracts';
import { BoxService } from './box.service';

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
    /*
     * [{tokenId: 5}, {tokenId: 7}, {tokenId: 8}] -> essa é a mais confiável
     *
     */

    const variasCaixasOffChain = await this.boxService.getBoxesByWalletId(
      walletAddress,
    );
    /*
     * [{tokenId: 5}, {tokenId: 9}]
     *
     */

    // TODO Depois...
    // if (boxesOnChain.length !== boxesOffChain.length) {
    //   //precisa rodar background job para atualizar dados
    // }

    //retornar o que é certo
    //para cada caixa onchain, checar se typeId bate,

    //pesquisar sobre reduce no javascript
    const boxes = [];

    for (const box of boxesOnChain) {
      for (const umaCaixaOffChain of variasCaixasOffChain) {
        if (box.tokenId === umaCaixaOffChain.tokenId) {
          boxes.push({
            ...box,
            isOpen: umaCaixaOffChain.isOpen,
          });
        } else {
          //aqui signifca que a caixa mudou de dono ou comprou nova
          //precisa preencher com os dados normalmente
        }
      }
    }

    //popular com os dados adicionais offchain, isto é, descrição da caixa, se isOpen, idcaixa aberta, id caixa fechada,
    //tipo, specications, type, lastUboxingStarted, idToyo caso isOpen

    return {
      wallet: walletAddress,
      boxes: boxesOnChain.concat(variasCaixasOffChain),
    };
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
