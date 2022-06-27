import { Card } from './Card';
import { IToyoPersona } from './IToyoPersona';

export interface Parts {
  id: string;
  bonusStats: object;
  toyoTechnoalloy: string;
  cards: Card[];
  toyoPersona: IToyoPersona;
  toyoPiece: string;
  stats: object;
  createdAt: Date;
  updateAt: Date;
}
