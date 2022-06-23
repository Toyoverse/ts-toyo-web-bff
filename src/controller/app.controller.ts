import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from '../service/app.service';
import { Request, Response } from 'express';

@Controller('/player')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/environment')
  async environment(@Req() request: Request, @Res() response: Response){
    try {
      const player = await this.appService.findPlayerEnverinmentByWalletId(request.walletId);

      if (player.wallet === request.walletId){
        response.status(200).json({
          player
        })
      } else {
        return response.status(500).json({
          error: ['The informed player does not match the returned player'],
        });
      }
    } catch {
      return response.status(500).json({
        errors: ['Error could not return player'],
      });
    }
  }
}
