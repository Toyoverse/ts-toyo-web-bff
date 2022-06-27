import { Box } from './interfaces/Box';
import PartsModel from './Part.model';
import PlayerModel from './Player.model';
import { IToyo } from './interfaces/IToyo';
import { buffer } from 'stream/consumers';

export default class BoxModel implements Box {
  private objectId?: string;
  type: number;
  isOpen: boolean;
  toyo: IToyo;
  hash: string;
  idOpenBox: string;
  idClosedBox: string;
  player?: PlayerModel;
  parts: PartsModel[];
  createdAt?: Date;
  updateAt?: Date;
  tokenId: string;
  typeId: string;
  specification?: string[];
  lastUnboxingStartedAt?: Date;

  constructor() {}

  get id() {
    return this.objectId;
  }
  set id(objectId: string) {
    const base64data = Buffer.from(objectId).toString('base64');
    this.objectId = base64data;
  }
}
