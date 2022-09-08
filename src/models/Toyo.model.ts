import PartsModel from './Part.model';
import { IToyoPersona, IToyo } from './interfaces';
import { ApiProperty } from '@nestjs/swagger';
import ToyoPersonaModel from './ToyoPersona.model';

export default class ToyoModel implements IToyo {
  @ApiProperty()
  private objectId: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  parts?: PartsModel[];
  @ApiProperty()
  hasTenParts: boolean;
  @ApiProperty()
  isToyoSelected: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updateAt: Date;
  @ApiProperty()
  tokenId: string;
  @ApiProperty()
  transactionHash: string;
  @ApiProperty()
  toyoPersonaOrigin?: ToyoPersonaModel;

  constructor(attrs?: { id: string; name: string }) {
    if (attrs) {
      this.id = attrs.id;
      this.name = attrs.name;
    }
  }

  get id() {
    return this.objectId;
  }
  set id(objectId: string) {
    const base64data = Buffer.from(objectId).toString('base64');
    this.objectId = base64data;
  }
}
