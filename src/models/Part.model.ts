import CardModel from "./Card.model";
import { Parts } from "./interfaces/Part";
import ToyoPersonaModel from "./ToyoPersona.model";

export default class PartModel implements Parts{
    private objectId: string;
    bonusStats: object;
    toyoTechnoalloy: string;
    cards: CardModel[];
    toyoPersona: ToyoPersonaModel;
    toyoPiece: string;
    stats: object;
    createdAt: Date;
    updateAt: Date;

    constructor(){}

    get id(){
        return this.objectId;
    }
    set id(objectId: string){
        const base64data = Buffer.from(objectId).toString('base64');
        this.objectId = base64data;
    }
   
}