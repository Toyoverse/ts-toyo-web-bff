import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ToyoModel from '../models/Toyo.model'
import * as Parse from 'parse/node';
import { response } from 'express';
import { json } from 'stream/consumers';
import PartModel from 'src/models/Part.model';
import { PartService } from './part.service';

@Injectable()
export class ToyoService {
  constructor(private configService: ConfigService, 
    private readonly partService: PartService) {
    this.ParseServerConfiguration();
  }

  async findToyoById(id: string): Promise<ToyoModel>{
    const Toyo = Parse.Object.extend("Toyo", ToyoModel);
    const toyoQuery = new Parse.Query(Toyo);
    toyoQuery.equalTo('objectId', id);
    
    try{
      const result = await toyoQuery.find();
    
      if (result.length < 1 || result[0].id !== id){
        response.status(404).json({
          erros: ['Card not found!'],
        });
      }

      const toyo: ToyoModel = await this.ToyoMapper(result[0]);

      return toyo;
    }
    catch(error){
      response.status(500).json({
        error: [error.message],
      });
    } 

  }

  private async ToyoMapper(result: Parse.Object<Parse.Attributes>): Promise<ToyoModel>{
    const toyo: ToyoModel = new ToyoModel();

    toyo.id = result.id;
    toyo.name = result.get('name');
    toyo.parts = await this.PartsMapper(await result.relation('parts').query().find());
    toyo.hasTenParts = result.get('hasTenParts');
    toyo.isToyoSelected = result.get('isToyoSelected');
    toyo.createdAt = result.get('createdAt');
    toyo.updateAt = result.get('updatedAt');

    return toyo;
  } 
  private async  PartsMapper(result: Parse.Object<Parse.Attributes>[]): Promise<PartModel[]>{
    const parts: PartModel[] = [];

    for (let index = 0; index < result.length; index++) {
      parts.push(await this.partService.findPartById(result[index].id));
    }

    return parts
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
