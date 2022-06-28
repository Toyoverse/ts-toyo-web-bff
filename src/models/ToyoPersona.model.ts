import { ApiProperty } from '@nestjs/swagger';
import { IToyoPersona } from './interfaces/IToyoPersona';

export default class ToyoPersonaModel implements IToyoPersona {
  @ApiProperty()
  name: string;
  @ApiProperty()
  thumbnail: string;
  @ApiProperty()
  video: string;
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
  @ApiProperty()
  rarity?: string;

  constructor() {}
}
