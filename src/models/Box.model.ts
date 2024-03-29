import { Box } from './interfaces/Box';
import PartsModel from './Part.model';
import PlayerModel from './Player.model';
import { IToyo } from './interfaces/IToyo';
import { buffer } from 'stream/consumers';
import { ApiProperty } from '@nestjs/swagger';
import ToyoRegion from './ToyoRegion.model';
import { Parts } from './interfaces/Part';
import PartModel from './Part.model';

export default class BoxModel implements Box {
  @ApiProperty()
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
  tokenIdOpenBox: string;
  @ApiProperty()
  tokenIdClosedBox: string;
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
  @ApiProperty()
  typeIdClosedBox: string;
  @ApiProperty()
  typeIdOpenBox: string;
  @ApiProperty()
  parts?: PartModel[];

  constructor() {}

  get id() {
    return this.objectId;
  }
  set id(objectId: string) {
    const base64data = Buffer.from(objectId).toString('base64');
    this.objectId = base64data;
  }
}
