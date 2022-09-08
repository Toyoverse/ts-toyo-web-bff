import { Injectable } from "@nestjs/common";
import { IBoxOnChain } from "src/models/interfaces/IBoxOnChain";
import { IUpdateToyo } from "src/models/interfaces/IUpdateToyo";
import { ToyoService } from "src/service";

@Injectable()
export class ToyoJobConsumer{
    constructor(private readonly toyoService: ToyoService){}

    async updateToyo(job: IUpdateToyo){
        const toyo = await this.toyoService.updateToyoCurrentPlayer(job);
    }
    async saveLogToyoJob(job:IBoxOnChain){
        const toyo = await this.toyoService.saveLogToyoCurrentPlayer(job);
    }

}