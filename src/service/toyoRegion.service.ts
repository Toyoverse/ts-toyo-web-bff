import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Parse from 'parse/node';
import { response } from 'express';
import ToyoRegion from 'src/models/ToyoRegion.model';
import ToyoRegionModel from 'src/models/ToyoRegion.model';

@Injectable()
export class ToyoRegionService {
  constructor(private configService: ConfigService) {
    this.ParseServerConfiguration();
  }

  async findRegionByName(name: string, isPost?: boolean): Promise<ToyoRegion> {
    const toyoRegion = Parse.Object.extend('ToyoRegion', ToyoRegion);
    const toyoRegionQuery = new Parse.Query(toyoRegion);
    toyoRegionQuery.equalTo('name', name);

    try {
      const result = await toyoRegionQuery.find();
      if (result.length < 1 || result[0].get('name') !== name) {
        response.status(404).send({
          erros: ['Toyo persona not found!'],
        });
      }
      let region: ToyoRegion = this.toyoRegionMapper(result[0]);
      if (isPost) {
        region = this.toyoRegionMapperWithIdDecoded(result[0]);
      } else {
        region = this.toyoRegionMapper(result[0]);
      }

      return region;
    } catch (error) {
      response.status(500).send({
        error: [error.message],
      });
    }
  }

  private toyoRegionMapper(result: Parse.Object<Parse.Attributes>): ToyoRegion {
    const region = new ToyoRegionModel();

    region.id = result.id;
    region.name = result.get('name');
    region.createdAt = result.get('createdAt');
    region.updatedAt = result.get('updatedAt');
    region.managedTypes = result.get('managedTypes');

    return region;
  }
  private toyoRegionMapperWithIdDecoded(
    result: Parse.Object<Parse.Attributes>,
  ): ToyoRegion {
    const region = new ToyoRegionModel();

    region.objectId = result.id;
    region.name = result.get('name');
    region.managedTypes = result.get('managedTypes');

    return region;
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
