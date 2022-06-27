import { IToyoPersona } from './interfaces/IToyoPersona';

export default class ToyoPersonaModel implements IToyoPersona {
  private objectId: string;
  name: string;
  thumbnail: string;
  video: string;
  bodyType: number;
  createdAt: Date;
  updateAt: Date;

  constructor() {}

  get id() {
    return this.objectId;
  }
  set id(objectId: string) {
    const base64data = Buffer.from(objectId).toString('base64');
    this.objectId = base64data;
  }
}
