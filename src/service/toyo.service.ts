import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ToyoModel from '../models/Toyo.model';
import * as Parse from 'parse/node';
import { response } from 'express';
import PartModel from 'src/models/Part.model';
import { PartService } from './part.service';
import { OnchainService } from './onchain.service';
import { TypeId } from 'src/enums/SmartContracts';
import { IToyo, IToyoPersona } from '../models/interfaces';
import { ToyoPersonaService } from './toyoPersona.service';
import { IBoxOnChain } from '../models/interfaces/IBoxOnChain';
import PlayerModel from 'src/models/Player.model';
import { ILog } from 'src/models/interfaces/ILog';
import { IUpdateToyo } from 'src/models/interfaces/IUpdateToyo';
import { BoxService, HashBoxService, ToyoJobProducer } from '.';
import { ISwappedEntities } from 'src/models/interfaces/ISwappedEntities';

@Injectable()
export class ToyoService {
  constructor(
    private configService: ConfigService,
    private readonly partService: PartService,
    private readonly toyoPersonaService: ToyoPersonaService,
    private readonly onchainService: OnchainService,
    @Inject(forwardRef(() => ToyoJobProducer))
    private readonly toyoJobProducer: ToyoJobProducer,
    @Inject(forwardRef(() => BoxService))
    private readonly boxService: BoxService,
    @Inject(forwardRef(() => HashBoxService))
    private readonly hashBoxService: HashBoxService,
  ) {
    this.ParseServerConfiguration();
  }

  async findToyoById(id: string): Promise<ToyoModel> {
    const Toyo = Parse.Object.extend('Toyo');
    const toyoQuery = new Parse.Query(Toyo);
    toyoQuery.equalTo('objectId', id);

    try {
      const result = await toyoQuery.find();

      if (result.length < 1 || result[0].id !== id) {
        response.status(404).json({
          erros: ['Toyo not found!'],
        });
        return;
      }
      const parts = await result[0].relation('parts').query().find();
      const toyo: ToyoModel = await this.ToyoMapper(result[0], parts);

      return toyo;
    } catch (error) {
      response.status(500).json({
        error: [error.message],
      });
    }
  }

  async findToyoByTokenId(tokenId: string): Promise<Parse.Object[]> {
    const Toyo = Parse.Object.extend('Toyo');
    const toyoQuery = new Parse.Query(Toyo);
    toyoQuery.equalTo('tokenId', tokenId);

    try {
      const result = await toyoQuery.find();
      return result;
    } catch (error) {
      response.status(500).json({
        error: [error.message],
      });
    }
  }

  async getOffChainToyos(walletAddress: string): Promise<Parse.Object[]> {
    try {
      const Toyo = Parse.Object.extend('Players');
      const toyoQuery: Parse.Query = new Parse.Query(Toyo);

      toyoQuery.equalTo('walletAddress', walletAddress);

      const player = await toyoQuery.find();
      const toyos = await player[0]
        .relation('toyos')
        .query()
        .limit(500)
        .include('toyoPersonaOrigin')
        .find();

      return toyos;
    } catch (error) {
      response.status(500).json({
        error: [error.message],
      });
    }
  }

  async getToyosByWalletAddress(walletAddress: string): Promise<ToyoModel[]> {
    console.log('walletAddress: ' + walletAddress);
    const onChainToyos: IBoxOnChain[] =
      await this.onchainService.getTokenOwnerEntityByWalletAndTypeId(
        walletAddress,
        [TypeId.TOYO],
      );

    const offChainToyos = await this.getOffChainToyos(walletAddress);
    const toyos: Array<ToyoModel> = [];
    for (const item of onChainToyos) {
      const toyo: Parse.Object = offChainToyos.find((tOff) => {
        console.log(tOff.toJSON());
        return tOff.get('tokenId') === item.tokenId;
      });
      if (toyo) {
        toyos.push(await this.ToyoMapper(toyo));
      } else {
        const newToyo = await this.findToyoByTokenId(item.tokenId);
        if (newToyo.length >= 1) {
          // console.log('vou ter que chamar um background: ' + item.tokenId);
          this.toyoJobProducer.updateToyo(walletAddress, newToyo[0]);
          toyos.push(await this.ToyoMapper(newToyo[0]));
        } else {
          const toyoSwap = await this.getToyoSwap(walletAddress, item.transactionHash);
          if (toyoSwap) toyos.push(await this.ToyoMapper(toyoSwap[0]));
          //this.toyoJobProducer.updateToyoSwap(walletAddress, item.transactionHash);
        }
      }
    }
    return toyos;
  }
  async getToyoById(id: string): Promise<ToyoModel> {
    const toyoId: string = Buffer.from(id, 'base64').toString('ascii');

    const toyo: ToyoModel = await this.findToyoById(toyoId);

    return toyo;
  }
  async getToyoSwap(
    walletId: string,
    transactionHash: string,
  ): Promise<Parse.Object<Parse.Attributes>[]> {
    let boxToyo: ISwappedEntities;
    let boxOpen: ISwappedEntities;
    const swap =
      await this.onchainService.getTokenSwappedEntitiesByWalletAndTokenId(
        walletId,
        transactionHash,
      );
    for (const boxOn of swap) {
      if (boxOn.toTypeId == '9') {
        boxToyo = boxOn;
      } else {
        boxOpen = boxOn;
      }
    }
    if (swap.length >= 1) {
      const box = await this.boxService.findBoxByTokenId(boxOpen.fromTokenId);
      const toyoHash = await this.hashBoxService.decryptHash(box.get('toyoHash'));
      const toyoId: string = Buffer.from(toyoHash, 'base64').toString('ascii');
      const Toyo = Parse.Object.extend("Toyo");
      const toyoQuery = new Parse.Query(Toyo);
      toyoQuery.equalTo('objectId', toyoId);
      const toyo = await toyoQuery.include('parts').find();
      const parts = await toyo[0].relation('parts').query().find();
      const relation = toyo[0].relation('parts');
      relation.add(parts);
      toyo[0].set('tokenId', boxToyo.toTokenId);
      toyo[0].set('transactionHash', transactionHash);
      await toyo[0].save();
      return toyo;
    } else {
      const toyoLogs: IBoxOnChain = {
        currentOwner: walletId,
        transactionHash: transactionHash,
      };
      this.toyoJobProducer.saveToyo(toyoLogs);
      return undefined;
    }
  }

  async ToyoMapper(
    result: Parse.Object<Parse.Attributes>,
    parts?: Parse.Object<Parse.Attributes>[],
  ): Promise<ToyoModel> {
    const toyo: ToyoModel = new ToyoModel();

    toyo.id = result.id;
    toyo.name = result.get('name');
    toyo.hasTenParts = result.get('hasTenParts');
    toyo.isToyoSelected = result.get('isToyoSelected');
    toyo.createdAt = result.get('createdAt');
    toyo.updateAt = result.get('updatedAt');
    toyo.tokenId = result.get('tokenId');
    toyo.transactionHash = result.get('transactionHash');
    toyo.toyoPersonaOrigin = result.get('toyoPersonaOrigin')
      ? await this.toyoPersonaService.findToyoPersonaById(
          result.get('toyoPersonaOrigin').id,
        )
      : undefined;

    if (parts) {
      const partsArray = [];
      for (const part of parts) {
        partsArray.push(await this.partService.PartMapper(part));
      }

      toyo.parts = partsArray;
    }

    return toyo;
  }
  async ToyoMapperWithOutIdCreatedUpdated(
    result: Parse.Object<Parse.Attributes>,
    parts?: Parse.Object<Parse.Attributes>[],
  ): Promise<ToyoModel> {
    const toyo: ToyoModel = new ToyoModel();

    toyo.name = result.get('name');
    toyo.hasTenParts = result.get('hasTenParts');
    toyo.isToyoSelected = result.get('isToyoSelected');
    toyo.tokenId = result.get('tokenId');
    toyo.transactionHash = result.get('transactionHash');
    toyo.toyoPersonaOrigin = result.get('toyoPersonaOrigin')
      ? await this.toyoPersonaService.findToyoPersonaById(
          result.get('toyoPersonaOrigin').id,
        )
      : undefined;

    if (parts) {
      const partsArray = [];
      for (const part of parts) {
        partsArray.push(await this.partService.PartMapperWithIdDecoded(part));
      }

      toyo.parts = partsArray;
    }

    return toyo;
  }
  async saveLogToyoCurrentPlayer(onChain: IBoxOnChain): Promise<ILog> {
    try {
      const Log = Parse.Object.extend('Logs');
      const log = new Log();

      await log.save({
        type: 'Error',
        message: 'Toyo does not exist in off-chain database',
        data: {
          transactionHash: onChain.transactionHash,
          walletAddress: onChain.currentOwner,
        },
      });

      return log;
    } catch (e) {
      response.status(500).json({
        error: [e.message],
      });
    }
  }
  async updateToyoCurrentPlayer(
    toyoUpdate: IUpdateToyo,
  ): Promise<Parse.Object<Parse.Attributes>> {
    try {
      const Player = Parse.Object.extend('Players');
      const playerQuery = new Parse.Query(Player);
      playerQuery.equalTo('walletAddress', toyoUpdate.wallet);
      const player = await playerQuery.find();
      let toyo: Parse.Object<Parse.Attributes>[];

      if (toyoUpdate.tokenId) {
        const Toyo = Parse.Object.extend('Toyo');
        const toyoQuery = new Parse.Query(Toyo);
        toyoQuery.equalTo('tokenId', toyoUpdate.tokenId);
        toyo = await toyoQuery.find();
      }

      if (toyoUpdate.transactionHash) {
        toyo = await this.getToyoSwap(
          toyoUpdate.wallet,
          toyoUpdate.transactionHash,
        );
      }

      const ralation = player[0].relation('toyos');
      ralation.add(toyo[0]);
      await player[0].save();

      return toyo[0];
    } catch (e) {
      response.status(500).json({
        error: [e.message],
      });
    }
  }
  private async partsMapper(toyoId: string): Promise<PartModel[]> {
    const Toyo = Parse.Object.extend('Toyo');
    const toyoQuery = new Parse.Query(Toyo);
    toyoQuery.equalTo('objectId', toyoId);

    try {
      const result = await toyoQuery.find();
      const resultId = await result[0].relation('parts').query().find();
      const parts: PartModel[] = [];

      for (const box of resultId) {
        parts.push(await this.partService.findPartById(box.id));
      }
      return parts;
    } catch (e) {
      console.log(e);
      response.status(500).json({
        error: [e.message],
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
