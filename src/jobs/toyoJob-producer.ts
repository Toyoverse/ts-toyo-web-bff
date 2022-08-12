import { Injectable } from "@nestjs/common";
import * as qjobs from 'qjobs'
import { IBoxOnChain } from "src/models/interfaces/IBoxOnChain";
import { IUpdateToyo } from "src/models/interfaces/IUpdateToyo";
import { ToyoJobConsumer } from "./toyoJob-consumer";

@Injectable()
export class ToyoJobProducer{
    constructor(private readonly toyoJobCosumer: ToyoJobConsumer){}

    async updateToyo(walletAddress: string, toyo: Parse.Object<Parse.Attributes>,){
        const q = new qjobs();
        const toyoUpdate: IUpdateToyo = {
            wallet: walletAddress,
            tokenId: toyo.get('tokenId'),
          };
        q.add(this.toyoJobCosumer.updateToyo(toyoUpdate));
    }

    async saveToyo(toyo: IBoxOnChain){
        const q = new qjobs();
        q.add(this.toyoJobCosumer.saveLogToyoJob(toyo));
    }
}