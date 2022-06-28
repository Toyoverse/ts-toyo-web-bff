import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { EnvironmentService, ToyoService } from '../service';
import { Request, Response } from 'express';
import ToyoModel from 'src/models/Toyo.model';
import { ApiHeader, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import BoxModel from 'src/models/Box.model';

@ApiHeader({
  name: 'Authorization',
  description: 'Token header returned on login',
})
@Controller('/player')
export class AppController {
  constructor(
    private readonly EnvironmentService: EnvironmentService,
    private readonly toyoService: ToyoService,
  ) {}

  @ApiTags('boxes')
  @Get('/boxes')
  @ApiResponse({
    status: 200,
    type: BoxModel,
  })
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

  @ApiTags('toyos')
  @Get('/toyos')
  @ApiResponse({
    status: 200,
    type: ToyoModel,
  })
  async getPlayerToyos(@Req() request: Request, @Res() response: Response) {
    try {
      const playerToyos: ToyoModel[] =
        await this.toyoService.getToyosByWalletAddress(request.walletId);

      return response.status(200).json({
        toyos: playerToyos,
      });
    } catch (e) {
      console.log(e);
      return response.status(500).json({
        errors: ['Error could not return boxes'],
      });
    }
  }

  @ApiTags('toyos')
  @ApiParam({
    name: 'id',
    description: 'Toyo Id to get details',
  })
  @Get('/toyo/:id')
  async getToyoDetail(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id,
  ) {
    //partes
    //cartas
    //etc
    console.log(id);
  }
}
