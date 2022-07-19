import { Job } from 'bull';
import { Processor, Process, OnQueueActive, OnQueueError, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { PlayerService, ToyoService } from 'src/service';
import { IBoxOnChain } from 'src/models/interfaces/IBoxOnChain';
import PlayerModel from 'src/models/Player.model';

@Processor({
    name: 'toyo-queue',
})
export class ToyoConsumer{

    constructor( 
        private readonly playerService: PlayerService,
        private readonly toyoService: ToyoService,
        ){}

    @Process('updateToyo-queue')
    async updateToyoJob(job: Job<PlayerModel>){
        const { data } = job;
        const toyo = await this.toyoService.updateToyoCurrentPlayer(data);
        return toyo;
        
    }

    @Process('saveToyo-queue')
    async saveToyoJob(job: Job<IBoxOnChain>){
        const { data } = job;
        const player =  await this.playerService.findPlayerByWalletId(data.currentOwner);
        const toyo = await this.toyoService.saveToyoCurrentPlayer(player, data);
        return toyo;

    }

}