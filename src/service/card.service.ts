import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CardModel from '../models/Card.model'
import * as Parse from 'parse/node';
import { response } from 'express';
import { json } from 'stream/consumers';

@Injectable()
export class CardService {
  constructor(private configService: ConfigService) {
    this.ParseServerConfiguration();
  }

  async findCardById(id: string): Promise<CardModel>{
    const Cards = Parse.Object.extend("Cards", CardModel);
    const cardsQuery = new Parse.Query(Cards);
    cardsQuery.equalTo('objectId', id);
    
    try{
      const result = await cardsQuery.find();
    
      if (result.length < 1 || result[0].id !== id){
        response.status(404).json({
          erros: ['Card not found!'],
        });
      }

      const card: CardModel = this.CardMapper(result[0]);

      return card;
    }
    catch(error){
      response.status(500).json({
        error: [error.message],
      });
    } 

  }

  private CardMapper(result: Parse.Object<Parse.Attributes>): CardModel{
    const card: CardModel = new CardModel();

    card.id = result.id;
    card.attackType = result.get('attackType');
    card.image_ = result.get('image_');
    card.cardType = result.get('cardType');
    card.name = result.get('name');
    card.cost = result.get('cost');
    card.attackSubType = result.get('attackSubType');
    card.duration = result.get('duration');
    card.defenseType = result.get('defenseType');
    card.attackAnimation= result.get('attackAnimation');
    card.effectName = result.get('effectName');
    card.applyEffect = result.get('applyEffect');
    card.createdAt = result.get('createdAt');
    card.updateAt = result.get('updatedAt');

    return card;
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
