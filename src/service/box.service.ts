import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import BoxModel from '../models/Box.model'
import * as Parse from 'parse/node';
import { response } from 'express';
import { json } from 'stream/consumers';
import { PartService } from './part.service';
import { ToyoService } from './toyo.service';
import { PlayerService } from './player.service';
import PartModel from 'src/models/Part.model';

@Injectable()
export class BoxService {
  constructor(private configService: ConfigService, 
    private readonly partService: PartService, 
    private readonly toyoService: ToyoService) {
    this.ParseServerConfiguration();
  }

  async findBoxById(id: string): Promise<BoxModel>{
    const Boxes = Parse.Object.extend("Boxes", BoxModel);
    const boxesQuery = new Parse.Query(Boxes);
    boxesQuery.equalTo('objectId', id);
    
    try{
      const result = await boxesQuery.find();
    
      if (result.length < 1 || result[0].id !== id){
        response.status(404).json({
          erros: ['Box not found!'],
        });
      }

      const box: BoxModel = await this.BoxMapper(result[0]);

      return box;
    }
    catch(error){
      response.status(500).json({
        error: [error.message],
      });
    } 

  }

  private async BoxMapper(result: Parse.Object<Parse.Attributes>): Promise<BoxModel>{
    const box: BoxModel = new BoxModel();

    box.id = result.id;
    box.type = result.get('type');
    box.isOpen = result.get('isOpen');
    box.toyo = await this.toyoService.findToyoById(result.get('toyo').id);
    box.hash = result.get('hash');
    box.idOpenBox = result.get('idOpenBox');
    box.idClosedBox = result.get('idClosedBox');
    box.parts = await this.PartsMapper(await result.relation('parts').query().find());
    box.createdAt = result.get('createdAt');
    box.updateAt = result.get('updatedAt');

    return box;
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
