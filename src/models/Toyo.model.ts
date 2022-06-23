import PartsModel from "./Part.model";
import { Toyo } from "./interfaces/Toyo";

export default class ToyoModel implements Toyo{
    private objectId: string;
    name: string;
    parts: PartsModel[];
    hasTenParts: boolean;
    isToyoSelected: boolean;
    createdAt: Date;
    updateAt: Date;

    
    constructor(){}

    get id(){
        return this.objectId;
    }
    set id(objectId: string){
        const base64data = Buffer.from(objectId).toString('base64')
        this.objectId = base64data;
    }
    
}