import PartsModel from './Part.model';
import { IToyoPersona, IToyo } from './interfaces';

export default class ToyoModel implements IToyo {
  private objectId: string;
  name: string;
  parts: PartsModel[];
  hasTenParts: boolean;
  isToyoSelected: boolean;
  createdAt: Date;
  updateAt: Date;
  tokenId: string;
  transactionHash: string;
  toyoPersona?: IToyoPersona;

  constructor() {}

  get id() {
    return this.objectId;
  }
  set id(objectId: string) {
    const base64data = Buffer.from(objectId).toString('base64');
    this.objectId = base64data;
  }
}
