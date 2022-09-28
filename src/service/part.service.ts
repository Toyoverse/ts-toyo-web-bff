import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PartModel from '../models/Part.model';
import * as Parse from 'parse/node';
import { response } from 'express';
import { json } from 'stream/consumers';
import { ToyoPersonaService } from './toyoPersona.service';
import CardModel from 'src/models/Card.model';
import { CardService } from './card.service';
import { ISwappedEntities } from 'src/models/interfaces/ISwappedEntities';
import ToyoModel from 'src/models/Toyo.model';
import { ToyoPart } from 'src/dtos/toyo-part/part';

@Injectable()
export class PartService {
  constructor(
    private configService: ConfigService,
    private readonly toyoPersonaService: ToyoPersonaService,
    private readonly cardService: CardService,
  ) {
    this.ParseServerConfiguration();
  }

  async findPartById(id: string, isPost?: boolean): Promise<PartModel> {
    const Part = Parse.Object.extend('ToyoParts', PartModel);
    const partQuery = new Parse.Query(Part);
    partQuery.equalTo('objectId', id);

    try {
      const result = await partQuery.include('toyoPersona').find();

      if (result.length < 1 || result[0].id !== id) {
        response.status(404).send({
          erros: ['Part not found!'],
        });
      }
      let part: PartModel;
      if (isPost) {
        part = await this.PartMapperWithIdDecoded(result[0]);
      } else {
        part = await this.PartMapper(result[0]);
      }

      return part;
    } catch (error) {
      response.status(500).send({
        error: [error.message],
      });
    }
  }

  async PartMapper(result: Parse.Object<Parse.Attributes>): Promise<PartModel> {
    const part: PartModel = new PartModel();

    part.id = result.id;
    part.bonusStats = result.get('bonusStats');
    part.toyoTechnoalloy = result.get('toyoTechnoalloy');
    // NOT NEEDY RIGHT NOW
    // part.cards = await this.CardsMapper(result.get('cards'));
    part.toyoPersona = result.get('toyoPersona')
      ? this.toyoPersonaService.ToyoPersonaMapper(result.get('toyoPersona'))
      : undefined;
    part.toyoPiece = result.get('toyoPiece');
    part.rarityId = result.get('rarityId');
    part.rarity = result.get('rarity');
    part.level = result.get('level');
    part.stats = result.get('stats');
    part.createdAt = result.get('createdAt');
    part.updateAt = result.get('updatedAt');

    return part;
  }
  async PartMapperWithIdDecoded(
    result: Parse.Object<Parse.Attributes>,
  ): Promise<PartModel> {
    const part: PartModel = new PartModel();

    part.objectId = result.id;
    part.bonusStats = result.get('bonusStats');
    part.toyoTechnoalloy = result.get('toyoTechnoalloy');
    // NOT NEEDY RIGHT NOW
    // part.cards = await this.CardsMapper(result.get('cards'));
    part.toyoPersona = result.get('toyoPersona')
      ? this.toyoPersonaService.ToyoPersonaMapper(result.get('toyoPersona'))
      : undefined;
    part.toyoPiece = result.get('toyoPiece');
    part.rarityId = result.get('rarityId');
    part.rarity = result.get('rarity');
    part.level = result.get('level');
    part.stats = result.get('stats');
    part.createdAt = result.get('createdAt');
    part.updateAt = result.get('updatedAt');

    return part;
  }
  buildParts(toyoPersona: Parse.Object<Parse.Attributes>): {
    parts: ToyoPart[];
    toyoLevel: number;
  } {
    const parts: ToyoPart[] = [];
    const partsName = [
      'HEAD',
      'CHEST',
      'R_ARM',
      'L_ARM',
      'R_HAND',
      'L_HAND',
      'R_LEG',
      'L_LEG',
      'R_FOOT',
      'L_FOOT',
    ];
    const rarity: number = toyoPersona.get('rarityId');

    const allPartsStats: Record<string, number> = {
      vitality: 0,
      resistance: 0,
      resilience: 0,
      physicalStrength: 0,
      cyberForce: 0,
      technique: 0,
      analysis: 0,
      agility: 0,
      speed: 0,
      precision: 0,
      stamina: 0,
      luck: 0,
    };
    for (let index = 0; index < partsName.length; index++) {
      const level = this._mapLevel(rarity);
      let sumStats = this._mapSumStats(level) - 5;

      const part: any = {
        toyoPiece: partsName[index],
        toyoTechnoalloy: 'WOOD',
        toyoPersona,
        isNFT: false,
        bonusStats: {},
        justTheStats: [
          { stat: 'vitality', value: 1 },
          { stat: 'resistance', value: 1 },
          { stat: 'resilience', value: 1 },
          { stat: 'physicalStrength', value: 1 },
          { stat: 'cyberForce', value: 1 },
          { stat: 'technique', value: 1 },
          { stat: 'analysis', value: 1 },
          { stat: 'agility', value: 1 },
          { stat: 'speed', value: 1 },
          { stat: 'precision', value: 1 },
          { stat: 'stamina', value: 1 },
          { stat: 'luck', value: 1 },
        ],
        rarityId: rarity,
        rarity: toyoPersona.get('rarity'),
        stats: {},
        level,
      };

      while (sumStats > 0) {
        const randomStat = Math.floor(Math.random() * part.justTheStats.length);
        part.justTheStats[randomStat].value++;
        sumStats--;
      }

      for (const justTheStat of part.justTheStats) {
        allPartsStats[justTheStat.stat] += justTheStat.value;
        part.stats[justTheStat.stat] = justTheStat.value;
      }

      delete part.justTheStats;
      part.stats['heartbond'] = 20;

      parts.push(part);
    }

    const levels: any = parts.map((part) => part.level);
    const maxLevel: number | undefined = Math.max(...levels);
    return { parts, toyoLevel: maxLevel };
  }
  private _mapLevel(rarity: number): number {
    let levels = [];
    let index: number;

    levels = [1, 2, 3, 4, 5];
    index = Math.floor(Math.random() * levels.length);
    return levels[index];
  }
  private _mapSumStats(level: number): number {
    let minSum = 0;
    let maxSum = 0;
    //TO DO aguardando retorno de Kevin
    const _mapRandomStat = (minSum: number, maxSum: number) =>
      Math.floor(Math.random() * (maxSum - minSum + 1) + minSum);

    switch (level) {
      case 7:
        minSum = 59;
        maxSum = 68;
        break;
      case 8:
        minSum = 68;
        maxSum = 77;
        break;
      case 9:
        minSum = 77;
        maxSum = 86;
        break;
      case 10:
        minSum = 86;
        maxSum = 95;
        break;
      case 11:
        minSum = 95;
        maxSum = 103;
        break;
      case 12:
        minSum = 103;
        maxSum = 111;
        break;
      default:
        throw new Error('Invalid level');
    }

    return _mapRandomStat(minSum, maxSum);
  }
  async saveParts(
    parts: ToyoPart[],
    toyoPersona: Parse.Object<Parse.Attributes>,
  ): Promise<Parse.Object<Parse.Attributes>[]> {
    const ToyomataParts = Parse.Object.extend('ToyomataParts', ToyoPart);
    const partsDB: Parse.Object<Parse.Attributes>[] = [];

    for (const part of parts) {
      let toyoParts: Parse.Object<Parse.Attributes> = new ToyomataParts();
      part.toyoPersona = toyoPersona;
      await toyoParts.save(part);
      partsDB.push(toyoParts);
    }
    return partsDB;
  }

  private async CardsMapper(result: string[]): Promise<CardModel[]> {
    const cards: CardModel[] = [];

    for (const card of result) {
      cards.push(await this.cardService.findCardById(card));
    }

    return cards;
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
