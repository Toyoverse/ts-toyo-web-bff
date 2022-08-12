import { Injectable } from '@nestjs/common';
import * as qjobs from 'qjobs'
import BoxModel from 'src/models/Box.model';
import { IBoxOnChain } from 'src/models/interfaces/IBoxOnChain';
import { BoxService } from 'src/service/box.service';

@Injectable()
export class BoxJobConsumer{
    constructor(private readonly boxService: BoxService){}
    
    async saveBoxJob(job: IBoxOnChain){
        const box:BoxModel = await this.boxService.saveBox(job);
    }
    
}
