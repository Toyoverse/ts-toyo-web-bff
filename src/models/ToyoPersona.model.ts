import { ApiProperty } from '@nestjs/swagger';
import { IToyoPersona } from './interfaces/IToyoPersona';

export default class ToyoPersonaModel implements IToyoPersona {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  rarityId: number;
  @ApiProperty()
  rarity?: string;
  @ApiProperty()
  thumbnail?: string;
  @ApiProperty()
  video?: string;
  @ApiProperty()
  bodyType: number;
  @ApiProperty()
  createdAt?: Date;
  @ApiProperty()
  updateAt?: Date;
  @ApiProperty()
  region?: string;
  @ApiProperty()
  description?: string;

  constructor(attrs?: {
    id?: string;
    name: string;
    thumbnail: string;
    video: string;
    bodyType: number;
    createdAt?: Date;
    updateAt?: Date;
    region?: string;
    description?: string;
    rarity?: string;
  }) {
    if (attrs) {
      this.id = attrs.id;
      this.name = attrs.name;
      this.thumbnail = attrs.thumbnail;
      this.video = attrs.video;
      this.bodyType = attrs.bodyType;
      this.createdAt = attrs.createdAt;
      this.updateAt = attrs.updateAt;
      this.region = attrs.region;
      this.description = attrs.description;
      this.rarity = attrs.rarity;
    }
  }
}
