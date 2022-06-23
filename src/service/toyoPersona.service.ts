import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ToyoPersona from '../models/ToyoPersona.model'
import * as Parse from 'parse/node';
import { response } from 'express';
import { json } from 'stream/consumers';

@Injectable()
export class ToyoPersonaService {
  constructor(private configService: ConfigService) {
    this.ParseServerConfiguration();
  }

  async findToyoPersonaById(id: string): Promise<ToyoPersona>{
    const toyoPersona = Parse.Object.extend("ToyoPersona", ToyoPersona);
    const toyoPersonaQuery = new Parse.Query(toyoPersona);
    toyoPersonaQuery.equalTo('objectId', id);
    
    try{
      const result = await toyoPersonaQuery.find();
      if (result.length < 1 || result[0].id !== id){
        response.status(404).json({
          erros: ['Toyo persona not found!'],
        });
      }

      const toyo = this.ToyoPersonaMapper(result[0]);
      
      return toyo;
    }
    catch(error){
      response.status(500).json({
        error: [error.message],
      });
    } 

  }

  private ToyoPersonaMapper(result: Parse.Object<Parse.Attributes>): ToyoPersona{
    const toyo: ToyoPersona = new ToyoPersona();

    toyo.id = result.id;
    toyo.name = result.get('name');
    toyo.thumbnail = result.get('thumbnail');
    toyo.video = result.get('video');
    toyo.bodyType = result.get('bodyType');
    toyo.createdAt = result.get('createdAt');
    toyo.updateAt = result.get('updatedAt');

    return toyo;
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
