import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { request, gql } from 'graphql-request';
import * as Parse from 'parse/node';

@Injectable()
export class TrainingService {
  constructor(private configService: ConfigService) {
    this.ParseServerConfiguration();
  }

  async getTrainingByToyoId(
    toyo: Parse.Object,
  ): Promise<Parse.Object<Parse.Attributes>[]> {
    const ToyoTrainingClass = Parse.Object.extend('ToyoTraining');
    const toyoTrainingQuery = new Parse.Query(ToyoTrainingClass);
    toyoTrainingQuery.equalTo('toyo', toyo);

    try {
      const result = await toyoTrainingQuery.findAll();
      return result;
    } catch (error) {
      return [];
    }
  }

  async getClosedTrainingsByToyoId(
    toyo: Parse.Object,
  ): Promise<Parse.Object<Parse.Attributes>[]> {
    const ToyoTrainingClass = Parse.Object.extend('ToyoTraining');
    const toyoTrainingQuery = new Parse.Query(ToyoTrainingClass);
    toyoTrainingQuery.equalTo('toyo', toyo);
    toyoTrainingQuery.exists('claimedAt');
    toyoTrainingQuery.exists('signature');

    try {
      const result = await toyoTrainingQuery.findAll();
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getClaimsByTokenId(tokenId: string) {
    const query = gql`
      {
        tokenClaimedEntities(first: 1000, where: {tokenId: "${tokenId.toString()}"}) {
          tokenId,
          id,
          cardCode,
          bondAmount
        }
      }
    `;

    const data: any = await request(
      this.configService.get<string>('THEGRAPH_URL'),
      query,
    );

    return data?.tokenClaimedEntities;
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
