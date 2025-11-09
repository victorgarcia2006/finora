import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CuentasService } from './cuentas.service';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { AuthGuard } from '@nestjs/passport';
import { TipoCuenta } from './enums/tipo-cuenta.enum';

@Controller('cuentas')
@UseGuards(AuthGuard('jwt'))
export class CuentasController {
  constructor(private readonly cuentasService: CuentasService) {}

  @Get()
  findAll(@Query('tipoCuenta') tipoCuenta?: TipoCuenta) {
    return this.cuentasService.findAll(tipoCuenta);
  }
}
