import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Parse from 'parse/node';
import ToyoModel from '../models/Toyo.model';
import { Crypt } from '../utils/crypt/crypt';
import di from '../di';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3Eth = require('web3-eth');

@Injectable()
export class HashBoxService {
  private secretKey: string;

  constructor(
    private configService: ConfigService,
    @Inject(di.AESCrypt) private crypt: Crypt,
  ) {
    this.ParseServerConfiguration();
    this.secretKey = this.configService.get<string>('PRIVATE_KEY_HASHBOX');
  }

  async decryptHash(hashbox: string): Promise<ToyoModel> {
    const jsonStr = this.crypt.decrypt(hashbox, this.secretKey);
    const { id, name } = JSON.parse(jsonStr);
    return new ToyoModel({ id, name });
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
