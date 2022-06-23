import { ToyoPersona } from "./interfaces/ToyoPersona";

export default class ToyoPersonaModel implements ToyoPersona{
    private objectId: string;
    name: string;
    thumbnail: string;
    video: string;
    bodyType: number;
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