import { Injectable } from '@nestjs/common';
import { Crypt } from './crypt';

import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AESCrypt implements Crypt {
  private iv: CryptoJS.lib.WordArray;

  private cfg: any;

  constructor(private configService: ConfigService) {
    this.iv = CryptoJS.enc.Hex.parse(
      this.configService.get<string>('CRYPTO_IV'),
    );

    this.cfg = {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      format: CryptoJS.format.Hex,
    };
  }

  encrypt(text: string, hexKey: string): string {
    hexKey = hexKey.replace('0x', '');

    const _key = CryptoJS.enc.Hex.parse(hexKey);
    return CryptoJS.AES.encrypt(text, _key, this.cfg).toString();
  }

  decrypt(ciphertext: string, hexKey: string): string {
    hexKey = hexKey.replace('0x', '');

    const _key = CryptoJS.enc.Hex.parse(hexKey);
    return CryptoJS.AES.decrypt(ciphertext, _key, this.cfg).toString(
      CryptoJS.enc.Utf8,
    );
  }
}
