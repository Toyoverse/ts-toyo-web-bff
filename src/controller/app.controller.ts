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
      const boxes = await this.EnvironmentService.findBoxesByWalletId(
        response.locals.walletId,
      );

      if (boxes.wallet === response.locals.walletId) {
        response.status(200).send({
          player: boxes,
        });
      } else {
        return response.status(500).send({
          error: ['The informed player does not match the returned player'],
        });
      }
    } catch (e) {
      console.log(e);
      return response.status(500).send({
        errors: ['Error could not return box'],
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
        await this.toyoService.getToyosByWalletAddress(
          response.locals.walletId,
        );

      return response.status(200).send({
        toyos: playerToyos,
      });
    } catch (e) {
      console.log(e);
      return response.status(500).send({
        errors: ['Error could not return toyos'],
      });
    }
  }

  @ApiTags('toyos')
  @ApiParam({ name: 'id', description: 'Toyo Id to get details' })
  @Get('/toyo/:id')
  @ApiResponse({ status: 200, type: ToyoModel })
  async getToyoDetail(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    try {
      const toyo: ToyoModel = await this.toyoService.getToyoById(id);

      return response.status(200).send({
        toyo: toyo,
      });
    } catch (e) {
      console.log(e);
      return response.status(500).send({
        erros: ['Error could not return toyo'],
      });
    }
  }
}
