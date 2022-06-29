import { Parts } from './Part';
import { Player } from './Player';
import { IToyo } from './IToyo';
import {IToyoRegion} from'./IToyoRegion';

export interface Box {
  id: string;
  type: string;
  isOpen: boolean;
  toyo: IToyo | undefined;
  hash: string;
  idOpenBox: string;
  idClosedBox: string;
  player?: Player;
  createdAt?: Date;
  updateAt?: Date;
  typeId: string;
  tokenId: string;
  region: IToyoRegion;
  modifiers: object;

}
