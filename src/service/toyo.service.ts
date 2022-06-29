import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ToyoService {
  
  constructor(
    private configService: ConfigService,
    private readonly partService: PartService,
    private readonly toyoPersonaService: ToyoPersonaService,
    private readonly onchainService: OnchainService,
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
          erros: ['Card not found!'],
        });
      }
      
      const toyo: ToyoModel = await this.ToyoMapper(result[0]);
      

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
    const onChainToyos =
      await this.onchainService.getTokenOwnerEntityByWalletAndTypeId(
        walletAddress,
        [TypeId.TOYO],
      );

    console.log(onChainToyos);

    const offChainToyos = await this.getOffChainToyos(walletAddress);
    const toyos: Array<ToyoModel> = [];
    for (const item of onChainToyos) {
      const toyo: Parse.Object = offChainToyos.find(
        (tOff) => tOff.get('tokenId') === item.tokenId,
      );
      if (toyo) {
        toyos.push(await this.ToyoMapper(toyo));
      } else {
        const newToyo = await this.findToyoByTokenId(item.tokenId);
        if (newToyo.length === 1) {
          //TODO Background job to update this new Toyo to Current Player
          toyos.push(await this.ToyoMapper(newToyo[0]));
        } else {
          console.log('não tem no bd');
        }
      }
    }
    return toyos;
  }
  async getToyoById(id: string): Promise<ToyoModel> {

    const toyoId: string = Buffer.from(id, 'base64').toString('ascii');

    const toyo: ToyoModel = await this.findToyoById(toyoId);
    toyo.parts = await this.partsMapper(toyoId);

    return toyo;
  }

  private async ToyoMapper(
    result: Parse.Object<Parse.Attributes>,
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
    const toyoPersona = result.get('toyoPersonaOrigin');
    toyo.toyoPersonaOrigin = toyoPersona
      ? await this.toyoPersonaService.findToyoPersonaById(toyoPersona.id)
      : undefined;

    return toyo;
  }
  private async partsMapper(toyoId: string): Promise<PartModel[]>{
    const Toyo = Parse.Object.extend('Toyo');
    const toyoQuery = new Parse.Query(Toyo);
    toyoQuery.equalTo('objectId', toyoId);

    try {
      const result = await toyoQuery.find();
      const resultId = await result[0].relation('parts').query().find();
      const parts: PartModel[] = [];
      
      for (const box of resultId ){
        parts.push( await this.partService.findPartById(box.id));
      }
      return parts;
  } catch (e){
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
