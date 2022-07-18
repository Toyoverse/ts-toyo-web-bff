import { Job } from 'bull';
import { Processor, Process, OnQueueActive, OnQueueError, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { BoxService } from 'src/service/box.service';
import { IBoxOnChain } from 'src/models/interfaces/IBoxOnChain';
import BoxModel from 'src/models/Box.model';

@Processor({
    name: 'saveBox-queue',
})
export class SaveBoxConsumer{

    constructor(
        private readonly boxService: BoxService){}

    @Process('saveBox-job')
    async saveBoxJob(job: Job<IBoxOnChain>){
        const {data} = job;
        const box = await this.boxService.saveBox(data);
        return box;
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