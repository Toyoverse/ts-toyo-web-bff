import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PartModel from '../models/Part.model'
import * as Parse from 'parse/node';
import { response } from 'express';
import { json } from 'stream/consumers';
import { ToyoPersonaService } from './toyoPersona.service';
import CardModel from 'src/models/Card.model';
import { CardService } from './card.service';

@Injectable()
export class PartService {
  constructor(private configService: ConfigService, 
    private readonly toyoPersonaService:ToyoPersonaService, 
    private readonly cardService:CardService) {
    this.ParseServerConfiguration();
  }

  async findPartById(id: string,): Promise<PartModel>{
    const Part = Parse.Object.extend("ToyoParts", PartModel);
    const partQuery = new Parse.Query(Part);
    partQuery.equalTo('objectId', id);
    
    try{
      const result = await partQuery.find();
    
      if (result.length < 1 || result[0].id !== id){
        response.status(404).json({
          erros: ['Part not found!'],
        });
      }
      
      const part = await this.PartMapper(result[0]);

      return part;
    }
    catch(error){
      response.status(500).json({
        error: [error.message],
      });
    } 

  }

  private async PartMapper(result: Parse.Object<Parse.Attributes>): Promise<PartModel>{
    const part: PartModel = new PartModel();

    part.id = result.id;
    part.bonusStats = result.get('bonusStats');
    part.toyoTechnoalloy = result.get('toyoTechnoalloy');
    part.cards = await this.CardsMapper(result.get('cards'));
    part.toyoPersona = await this.toyoPersonaService.findToyoPersonaById(result.get('toyoPersona').id);
    part.toyoPiece = result.get('toyoPiece');
    part.stats = result.get('stats');
    part.createdAt = result.get('createdAt');
    part.updateAt = result.get('updatedAt');

    return part;
  } 
  private async  CardsMapper(result: string[]):Promise<CardModel[]>{
    const cards: CardModel[] = [];

    for (let index = 0; index < result.length; index++) {
      cards.push(await this.cardService.findCardById(result[index]));
    }

    return cards
    
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
