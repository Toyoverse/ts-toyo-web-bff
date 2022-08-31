import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ToyoPersona from '../models/ToyoPersona.model';
import * as Parse from 'parse/node';
import { response } from 'express';

@Injectable()
export class ToyoPersonaService {
  constructor(private configService: ConfigService) {
    this.ParseServerConfiguration();
  }

  async findToyoPersonaById(id: string): Promise<ToyoPersona> {
    const toyoPersona = Parse.Object.extend('ToyoPersona', ToyoPersona);
    const toyoPersonaQuery = new Parse.Query(toyoPersona);
    toyoPersonaQuery.equalTo('objectId', id);

    try {
      const result = await toyoPersonaQuery.find();
      if (result.length < 1 || result[0].id !== id) {
        response.status(404).send({
          erros: ['Toyo persona not found!'],
        });
      }

      const toyo = this.ToyoPersonaMapper(result[0]);

      return toyo;
    } catch (error) {
      response.status(500).send({
        error: [error.message],
      });
    }
  }

  ToyoPersonaMapper(result: Parse.Object<Parse.Attributes>): ToyoPersona {
    const toyoPersona: ToyoPersona = new ToyoPersona();
    toyoPersona.objectId = result.id;
    toyoPersona.name = result.get('name');
    toyoPersona.rarityId = result.get('rarityId');
    toyoPersona.rarity = result.get('rarity');
    toyoPersona.thumbnail = result.get('thumbnail');
    toyoPersona.video = result.get('video');
    toyoPersona.bodyType = result.get('bodyType');
    toyoPersona.createdAt = result.get('createdAt');
    toyoPersona.updateAt = result.get('updatedAt');

    return toyoPersona;
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
