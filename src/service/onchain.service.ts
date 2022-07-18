import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeId } from '../enums/SmartContracts';
import { request, gql } from 'graphql-request';

@Injectable()
export class OnchainService {
  constructor(private configService: ConfigService) {}

  async getTokenOwnerEntityByWalletId(walletId: string): Promise<any> {
    const query = gql`
      {
        tokenOwnerEntities(first: 500, where: {currentOwner: "${walletId}"}) {
            typeId,
            transactionHash,
            tokenId,
            currentOwner
        }
      }
    `;

    const data: any = await request(
      this.configService.get<string>('THEGRAPH_URL'),
      query,
    );

    return data;
  }

  async getTokenOwnerEntityByWalletAndTypeId(
    walletId: string,
    typeId: Array<TypeId>,
  ): Promise<any> {
    const query = gql`
      {
        tokenOwnerEntities(first: 500, where: {currentOwner: "${walletId}", typeId_in: [${typeId}]}) {
            typeId,
            transactionHash,
            tokenId,
            currentOwner
        }
      }
    `;

    const data: any = await request(
      this.configService.get<string>('THEGRAPH_URL'),
      query,
    );

    return data.tokenOwnerEntities;
  }
  
  async getTokenSwappedEntitiesByWalletAndTokenId(walletId: string, transactionHash:string): Promise<any>{
    const query = gql`
    {
      tokenSwappedEntities(
        first: 500
        where: {sender: "${walletId}", transactionHash: "${transactionHash}"}
      ) {
        fromTokenId,
        fromTypeId,
        toTokenId,
        toTypeId
      }
    }
    `;
    const data: any = await request(
      this.configService.get<string>('THEGRAPH_URL'),
      query,
    );

    return data.tokenSwappedEntities;
  }
}
