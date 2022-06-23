import e from 'express';
import BoxModel from './Box.model';
import PartsModel from './Part.model';
import { Player } from './interfaces/Player'
import ToyoModel from './Toyo.model';

export default class PlayerModel implements Player{
    wallet: string;
    token: string;
    expiresAt: Date;
    private objectId: string;
    toyos: ToyoModel[];
    lastUnboxingFinishedAt: Date;
    hasPendingUnboxing: boolean;
    lastUnboxingStartedAt: Date;
    toyoParts: PartsModel[];
    boxes: BoxModel[];
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
    
    getExpiresAtFormatted(expiresAt: Date): string{
        return new Intl.DateTimeFormat('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: 'numeric'}).format(expiresAt)
    }
}