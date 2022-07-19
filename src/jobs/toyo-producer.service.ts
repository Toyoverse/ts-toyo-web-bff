import { InjectQueue } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Queue } from 'bull';
import { IBoxOnChain } from 'src/models/interfaces/IBoxOnChain';
import { PlayerService, ToyoService } from 'src/service';

@Injectable()
export class ToyoProducerService{

    constructor(
        @InjectQueue('toyo-queue') private queue: Queue,
        @Inject(forwardRef(() => PlayerService))
        private readonly playerService: PlayerService,
        @Inject(forwardRef(() => ToyoService))
        private readonly toyoService: ToyoService,
        ) {}

    async updateToyo(walletAddress: string, toyo: Parse.Object<Parse.Attributes>){
        const player = await this.playerService.findPlayerByWalletId(walletAddress);
        player.toyos.push(await this.toyoService.ToyoMapper(toyo));
        await this.queue.add('updateToyo-queue', player, {
            attempts: 3,
        })
    }
    async saveToyo(toyo: IBoxOnChain){
        await this.queue.add('saveToyo-queue', toyo, {
            attempts:3,
        });
    }

}