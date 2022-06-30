import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Parse from 'parse/node';
import { response } from 'express';
import ToyoRegion from "src/models/ToyoRegion.model";

@Injectable()
export class ToyoRegionService{
    constructor(private configService: ConfigService) {
        this.ParseServerConfiguration();
    }

    async findRegionById(id: string): Promise<ToyoRegion>{
      const region: ToyoRegion = new ToyoRegion();
        const toyoRegion = Parse.Object.extend('ToyoRegion', ToyoRegion);
        const toyoRegionQuery = new Parse.Query(toyoRegion);
        toyoRegionQuery.equalTo('objectId', id);
        
        try {
            const result = await toyoRegionQuery.find();
            if (result.length < 1 || result[0].id !== id) {
              response.status(404).json({
                erros: ['Toyo persona not found!'],
              });
            }

            region.name = result[0].get('name');

            return region;
        } catch (error) {
            response.status(500).json({
            error: [error.message],
      });
    }
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