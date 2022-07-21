import { Job } from 'bull';
import { Processor, Process, OnQueueActive, OnQueueError, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { PlayerService, ToyoService } from 'src/service';
import { IBoxOnChain } from 'src/models/interfaces/IBoxOnChain';
import PlayerModel from 'src/models/Player.model';
import { IUpdateToyo } from 'src/models/interfaces/IUpdateToyo';

@Processor({
    name: 'toyo-queue',
})
export class ToyoConsumer{

    constructor( 
        private readonly toyoService: ToyoService,
        ){}

    @Process('updateToyo-queue')
    async updateToyoJob(job: Job<IUpdateToyo>){
        const { data } = job;
        const toyo = await this.toyoService.updateToyoCurrentPlayer(data);
        return toyo;
    }

    @Process('saveLogToyo-queue')
    async saveLogToyoJob(job: Job<IBoxOnChain>){
        const { data } = job;
        const toyo = await this.toyoService.saveLogToyoCurrentPlayer(data);
        return toyo;

    }
    @OnQueueActive()
    onQueueActive(job: Job){
        console.log('Queue active');
    }
    @OnQueueCompleted()
    onQueueCompleted(job:Job){
        console.log("Queue completed");
    }
    @OnQueueFailed()
    onQueueFailed(job:Job){
        console.log('Queue failed');
    }

    @OnQueueError()
    onQueueError(job: Job){
        console.log('Queue error')
    }

}