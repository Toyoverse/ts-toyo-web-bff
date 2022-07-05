import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import BoxModel from '../models/Box.model';
import * as Parse from 'parse/node';
import { response } from 'express';
import { json } from 'stream/consumers';
import { PartService } from './part.service';
import { ToyoService } from './toyo.service';
import PartModel from 'src/models/Part.model';
import { TypeId } from 'src/enums/SmartContracts';

@Injectable()
export class BoxService {
  constructor(
    private configService: ConfigService,
    private readonly partService: PartService,
    private readonly toyoService: ToyoService,
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
      for (const boxOff of result){
        boxesOffChain.push(await this.BoxMapper(boxOff));
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
    const box:BoxModel = new BoxModel(); 
    box.id= result.id;
    box.typeId= result.get('typeId');
    box.type= result.get('type')
        ? result.get('type')
        : this.getType(box.typeId);
    box.region= result.get('region')
        ? await result.get('region').get('name')
        : this.getRegion(box.typeId);
    box.isOpen = result.get('isOpen');
    box.toyo = box.isOpen && result.get('toyo')
        ? await this.toyoService.ToyoMapper(result.get('toyo'))
        : undefined;
    box.tokenId= result.get('tokenId');
    box.lastUnboxingStartedAt = result.get('lastUnboxingStartedAt');
    box.modifiers= result.get('modifiers')
        ? result.get('modifiers')
        : this.getModifiers(box.typeId);
    box.createdAt= result.get('createdAt');
    box.updateAt= result.get('updatedAt');
      
    return box;
    
  }
  getRegion(type): string{
    if (type == TypeId.OPEN_FORTIFIED_JAKANA_SEED_BOX || 
      type == TypeId.OPEN_JAKANA_SEED_BOX ||
      type == TypeId.TOYO_FORTIFIED_JAKANA_SEED_BOX ||
      type == TypeId.TOYO_JAKANA_SEED_BOX){
        
        return 'JAKANA';
         
      }else if (type == TypeId.OPEN_FORTIFIED_KYTUNT_SEED_BOX ||
        type == TypeId.OPEN_KYTUNT_SEED_BOX ||
        type == TypeId.TOYO_FORTIFIED_KYTUNT_SEED_BOX ||
        type== TypeId.TOYO_KYTUNT_SEED_BOX){

          return 'KYTUNT';
      }
  }
  getModifiers(type){
    const key: number = parseInt(type, 10);
    switch (key) {
      case TypeId.TOYO_FORTIFIED_JAKANA_SEED_BOX || TypeId.OPEN_FORTIFIED_JAKANA_SEED_BOX:
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
      case TypeId.TOYO_JAKANA_SEED_BOX || TypeId.OPEN_JAKANA_SEED_BOX:
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
      case TypeId.TOYO_FORTIFIED_KYTUNT_SEED_BOX || TypeId.OPEN_FORTIFIED_KYTUNT_SEED_BOX:
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
      case TypeId.TOYO_KYTUNT_SEED_BOX || TypeId.OPEN_KYTUNT_SEED_BOX:
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
  getType(type) :string{
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
