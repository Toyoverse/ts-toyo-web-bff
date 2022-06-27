import { Parts } from './Part';

export interface IToyo {
  id: string;
  name: string;
  parts?: Parts[];
  hasTenParts: boolean;
  isToyoSelected: boolean;
  createdAt: Date;
  updateAt: Date;
}
