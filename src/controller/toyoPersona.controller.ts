import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'src/decorators/serialize.decorator';
import { ToyoPersonaSimpleDto } from 'src/dtos/toyo-personas/simple.dto';
import { ToyoPersonaService } from 'src/service';

@ApiTags('toyo-personas')
@Controller('toyo-personas')
export class ToyoPersonaController {
  constructor(private service: ToyoPersonaService) {}

  @ApiOkResponse({
    description: 'Returns list of toyo personas',
    type: () => ToyoPersonaSimpleDto,
    isArray: true,
  })
  @Get()
  @Serialize(ToyoPersonaSimpleDto)
  find() {
    return this.service.findToyoPersonas();
  }
}
