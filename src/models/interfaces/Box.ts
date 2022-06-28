import { Parts } from './Part';
import { Player } from './Player';
import { IToyo } from './IToyo';

export interface Box {
  id: string;
  type: number;
  isOpen: boolean;
  toyo: IToyo;
  hash: string;
  idOpenBox: string;
  idClosedBox: string;
  player?: Player;
  createdAt?: Date;
  updateAt?: Date;
  typeId: string;
  tokenId: string;
}
