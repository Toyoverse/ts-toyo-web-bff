import { Card } from "./Card";
import { ToyoPersona } from "./ToyoPersona";

export interface Parts{
    id: string;
    bonusStats: object;
    toyoTechnoalloy: string;
    cards: Card[];
    toyoPersona: ToyoPersona;
    toyoPiece: string; 
    stats: object;
    createdAt: Date;
    updateAt: Date;


}