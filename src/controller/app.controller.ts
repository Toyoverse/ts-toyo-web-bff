import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { EnvironmentService, ToyoService } from '../service';
import { Request, Response } from 'express';
import ToyoModel from 'src/models/Toyo.model';

@Controller('/player')
export class AppController {
  constructor(
    private readonly EnvironmentService: EnvironmentService,
    private readonly toyoService: ToyoService,
  ) {}

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
        request.walletId
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
  async getPlayerToyos(@Req() request: Request, @Res() response: Response) {
    try {
      const playerToyos: ToyoModel[] =
        await this.toyoService.getToyosByWalletAddress(request.walletId);

      return response.status(200).json({
        toyos: playerToyos,
      });
    } catch {
      return response.status(500).json({
        errors: ['Error could not return boxes'],
      });
    }
  }

  @Get('/toyo/:id')
  async getToyoDetail(
    @Req() request: Request,
    @Res() response: Response,
    @Param() params,
  ) {
    //partes
    //cartas
    //etc
    console.log(params.id);
  }
}
