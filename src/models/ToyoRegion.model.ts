import { IToyoRegion } from "./interfaces/IToyoRegion";

export default class ToyoRegionModel implements IToyoRegion{
    objectId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    
    constructor () {}
    get id(){
        return this.objectId;
    }
    set id (objectId:string){
        const base64data = Buffer.from(objectId).toString('base64');
        this.objectId = base64data;
    }
}