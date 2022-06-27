import { Box } from './Box';
import { Parts } from './Part';
import { IToyo } from './IToyo';

export interface Player {
  id: string;
  wallet: string;
  token: string;
  expiresAt: Date;
  toyos: IToyo[];
  lastUnboxingFinishedAt: Date;
  hasPendingUnboxing: boolean;
  lastUnboxingStartedAt: Date;
  toyoParts: Parts[];
  boxes: Box[];
  createdAt: Date;
  updateAt: Date;

  getExpiresAtFormatted(expiresAt: Date): string;
}
