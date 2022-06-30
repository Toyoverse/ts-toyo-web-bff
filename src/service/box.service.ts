import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import BoxModel from '../models/Box.model';
import * as Parse from 'parse/node';
import { response } from 'express';
import { json } from 'stream/consumers';
import { PartService } from './part.service';
import { ToyoService } from './toyo.service';
import { PlayerService } from './player.service';
import PartModel from 'src/models/Part.model';
import { ToyoRegionService } from './toyoRegion.service';
import ToyoRegionModel from 'src/models/ToyoRegion.model';
import { TypeId } from 'src/enums/SmartContracts';

@Injectable()
export class BoxService {
  constructor(
    private configService: ConfigService,
    private readonly partService: PartService,
    private readonly toyoService: ToyoService,
    private readonly toyoRegionService: ToyoRegionService,
  ) {
    this.ParseServerConfiguration();
  }

  async findBoxById(id: string): Promise<BoxModel> {
    const Boxes = Parse.Object.extend('Boxes', BoxModel);
    const boxesQuery = new Parse.Query(Boxes);
    boxesQuery.equalTo('objectId', id);

    try {
      const result = await boxesQuery.find();

      if (result.length < 1 || result[0].id !== id) {
        response.status(404).json({
          erros: ['Box not found!'],
        });
      }

      const box: BoxModel = await this.BoxMapper(result[0]);

      return box;
    } catch (error) {
      response.status(500).json({
        error: [error.message],
      });
    }
  }

  async getBoxesByWalletId(walletId: string) {
    try {
      const Boxes = Parse.Object.extend('Boxes');
      const Players = Parse.Object.extend('Players');
      const playerQuery = new Parse.Query(Players);
      playerQuery.equalTo('walletAddress', walletId);
      const player = await playerQuery.find();
      
      const result = await player[0]
        .relation('boxes')
        .query()
        .include('region')
        .include('toyo')
        .include('toyo.toyoPersonaOrigin')
        .find();
      
      const boxesOffChain: BoxModel[] = [];

      for (let index = 0; index < result.length; index++) {
        boxesOffChain.push(await this.findBoxById(result[index].id));
      }

      return boxesOffChain;
    } catch (error) {
      response.status(500).json({
        error: [error.message],
      });
    }
  }

  private async BoxMapper(
    result: Parse.Object<Parse.Attributes>,
  ): Promise<BoxModel> {
    const boxIsOpen: boolean = result.get('isOpen');
    const toyoRegion = result.get('region');
    const typeId = result.get('typeId');

    return {
      id: result.id,
      type: result.get('type'),
      isOpen: result.get('isOpen'),
      toyo: boxIsOpen
        ? await this.toyoService.findToyoById(result.get('toyo').id)
        : undefined,
      hash: result.get('hash'),
      idOpenBox: result.get('idOpenBox'),
      idClosedBox: result.get('idClosedBox'),
      createdAt: result.get('createdAt'),
      updateAt: result.get('updatedAt'),
      typeId: typeId,
      tokenId: result.get('tokenId'),
      lastUnboxingStartedAt: result.get('lastUnboxingStartedAt'),
      modifiers: result.get('modifiers'),
      region: toyoRegion
        ? await this.toyoRegionService.findRegionById(toyoRegion.id)
        : this.getRegion(typeId),
      
    };
    
  }
  getRegion(type): ToyoRegionModel{
    let region: ToyoRegionModel = new ToyoRegionModel();
    if (type == TypeId.OPEN_FORTIFIED_JAKANA_SEED_BOX || 
      type == TypeId.OPEN_JAKANA_SEED_BOX ||
      type == TypeId.TOYO_FORTIFIED_JAKANA_SEED_BOX ||
      type == TypeId.TOYO_JAKANA_SEED_BOX){
        
        region.name = 'JAKANA';
         
      }else if (type == TypeId.OPEN_FORTIFIED_KYTUNT_SEED_BOX ||
        type == TypeId.OPEN_KYTUNT_SEED_BOX ||
        type == TypeId.TOYO_FORTIFIED_KYTUNT_SEED_BOX ||
        type== TypeId.TOYO_KYTUNT_SEED_BOX){

          region.name = 'KYTUNT';
      }

      return region;
    
  }
  private async PartsMapper(
    result: Parse.Object<Parse.Attributes>[],
  ): Promise<PartModel[]> {
    const parts: PartModel[] = [];

    for (let index = 0; index < result.length; index++) {
      parts.push(await this.partService.findPartById(result[index].id));
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
