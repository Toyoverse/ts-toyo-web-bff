import { InjectQueue } from '@nestjs/bull';
import { Injectable } from "@nestjs/common";
import { Queue } from 'bull';
import BoxModel from 'src/models/Box.model';
import { IBoxOnChain } from 'src/models/interfaces/IBoxOnChain';

@Injectable()
export class SaveBoxProducerService{

    constructor(@InjectQueue('saveBox-queue') private queue: Queue) {}

    async saveBox(boxOff: BoxModel[], boxOn: IBoxOnChain[]){
        for(const box of boxOn){
            const result = boxOff.find(value => value.tokenId === box.tokenId);
      
            if (!result){
                await this.queue.add('saveBox-job', box, {
                    attempts:3,
                });
            }
        }
    }
}

