import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { PolizasService } from './polizas.service';
import { CreatePolizaDto } from './dto/create-poliza.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/auth/interfaces/req-with-user.interface';

@Controller('polizas')
@UseGuards(AuthGuard('jwt'))
export class PolizasController {
  constructor(private readonly polizasService: PolizasService) { }

  @Post()
  create( @Body() createPolizaDto: CreatePolizaDto, @Req() req: RequestWithUser) {
    const userPayload = req.user;

    return this.polizasService.create(createPolizaDto, userPayload.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) { 
    const userPayload = req.user;

    return this.polizasService.findAll(userPayload.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) { 
    return this.polizasService.findOne(id);
  }
}
