import {Card } from './interfaces/Card'

export default class CardModel implements Card{
    private objectId: string;
    attackType: string;
    image_: string;
    cardType: string;
    name: string;
    cost: number;
    attackSubType: string;
    duration: number;
    defenseType: string;
    attackAnimation: string;
    effectName: string;
    applyEffect: boolean;
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