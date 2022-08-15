import { Injectable } from '@nestjs/common';
import * as qjobs from 'qjobs'
import BoxModel from 'src/models/Box.model';
import { IBoxOnChain } from 'src/models/interfaces/IBoxOnChain';
import { BoxService } from 'src/service';
import { BoxJobConsumer } from './boxJob-cosumer';

@Injectable()
export class BoxJobProducer{
    constructor(
        private readonly boxJobCosumer: BoxJobConsumer,
        ){}

    async saveBox(boxOff: BoxModel[], boxOn: IBoxOnChain[]){
        for(const box of boxOn){
            const result = boxOff.find(value => value.tokenId === box.tokenId);
      
            if (!result){
                const q = new qjobs();
                q.add(this.boxJobCosumer.saveBoxJob(box));

            }
        }
    }
}