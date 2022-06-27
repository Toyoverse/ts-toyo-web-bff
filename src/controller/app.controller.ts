import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { EnvironmentService } from '../service/environment.service';
import { Request, Response } from 'express';

@Controller('/player')
export class AppController {
  constructor(private readonly EnvironmentService: EnvironmentService) {}

  @Get('/environment')
  async environment(@Req() request: Request, @Res() response: Response) {
    try {
      const player =
        await this.EnvironmentService.findPlayerEnvironmentByWalletId(
          request.walletId,
        );

      if (player.wallet === request.walletId) {
        response.status(200).json({
          player,
        });
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

  @Get('/boxes')
  async getPlayerBoxes(@Req() request: Request, @Res() response: Response) {
    try {
      const player = await this.EnvironmentService.findBoxesByWalletId(
        request.walletId,
      );

      if (player.wallet === request.walletId) {
        response.status(200).json({
          player,
        });
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

  @Get('/toyos')
  async getPlayerToyos(@Req() request: Request, @Res() response: Response) {}

  @Get('/toyo/:id')
  async getToyoDetail(
    @Req() request: Request,
    @Res() response: Response,
    @Param() params,
  ) {
    console.log(params.id);
  }
}
