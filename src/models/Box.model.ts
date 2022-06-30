import { Box } from './interfaces/Box';
import PartsModel from './Part.model';
import PlayerModel from './Player.model';
import { IToyo } from './interfaces/IToyo';
import { buffer } from 'stream/consumers';
import { ApiProperty } from '@nestjs/swagger';
import ToyoRegion from './ToyoRegion.model';

export default class BoxModel implements Box {
  private objectId?: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  isOpen: boolean;
  @ApiProperty()
  toyo: IToyo;
  @ApiProperty()
  hash: string;
  @ApiProperty()
  idOpenBox: string;
  @ApiProperty()
  idClosedBox: string;
  @ApiProperty()
  player?: PlayerModel;
  @ApiProperty()
  createdAt?: Date;
  @ApiProperty()
  updateAt?: Date;
  @ApiProperty()
  tokenId: string;
  @ApiProperty()
  typeId: string;
  @ApiProperty()
  lastUnboxingStartedAt?: Date;
  @ApiProperty()
  region: ToyoRegion | string;
  @ApiProperty()
  modifiers: object;

  constructor() {}

  get id() {
    return this.objectId;
  }
  set id(objectId: string) {
    const base64data = Buffer.from(objectId).toString('base64');
    this.objectId = base64data;
  }
}
