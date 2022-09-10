import { Parts } from './Part';
import { Player } from './Player';
import { IToyo } from './IToyo';
import {IToyoRegion} from'./IToyoRegion';

export interface Box {
  id: string;
  type: string;
  isOpen: boolean;
  toyo: IToyo;
  hash: string;
  tokenIdOpenBox: string;
  tokenIdClosedBox: string;
  player?: Player;
  createdAt?: Date;
  updateAt?: Date;
  typeId: string;
  tokenId: string;
  region: IToyoRegion | string;
  modifiers: object;
  typeIdClosedBox: string;
  typeIdOpenBox: string; 
  parts?:Parts[]

}
