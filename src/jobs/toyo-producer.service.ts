import { InjectQueue } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Queue } from 'bull';
import { IBoxOnChain } from 'src/models/interfaces/IBoxOnChain';
import { IUpdateToyo } from 'src/models/interfaces/IUpdateToyo';
import { PlayerService, ToyoService } from 'src/service';

@Injectable()
export class ToyoProducerService{

    constructor(
        @InjectQueue('toyo-queue') private queue: Queue,
        ) {}

    async updateToyo(walletAddress: string, toyo: Parse.Object<Parse.Attributes>){
        const toyoUpdate: IUpdateToyo = {
            toyo : toyo,
            wallet : walletAddress
        }
        await this.queue.add('updateToyo-queue', toyoUpdate, {
            attempts: 3,
        })
    }
    async saveToyo(toyo: IBoxOnChain){
        await this.queue.add('saveLogToyo-queue', toyo, {
            attempts:3,
        });
    }

}