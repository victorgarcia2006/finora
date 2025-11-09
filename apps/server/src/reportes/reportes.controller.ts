import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
import { RequestWithUser } from 'src/auth/interfaces/req-with-user.interface';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('reportes')
@UseGuards(AuthGuard('jwt'))
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) { }

  @Post('balance-general')
  async generarBalanceGeneral(
    @Body() generarReporteDto: GenerarReporteDto,
    @Req() req: RequestWithUser,
  ) {
    const usuarioId = req.user.userId;
    return await this.reportesService.generarBalanceGeneral(
      usuarioId,
      generarReporteDto,
    );
  }

  @Post('estado-resultados')
  async generarEstadoResultados(
    @Body() generarReporteDto: GenerarReporteDto,
    @Req() req: RequestWithUser,
  ) {
    const usuarioId = req.user.userId;
    return await this.reportesService.generarEstadoResultados(
      usuarioId,
      generarReporteDto,
    );
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    const usuarioId = req.user.userId;
    return this.reportesService.findAll(usuarioId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const usuarioId = req.user.userId;
    return this.reportesService.findOne(usuarioId, id);
  }

  @Get(':id/exportar')
  async exportarExcel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const usuarioId = req.user.userId;

    // 1. El servicio genera el buffer y el nombre
    const { buffer, fileName } = await this.reportesService.exportarExcel(
      usuarioId,
      id,
    );

    // 2. Establecemos los headers para la descarga
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}`,
    );

    // 3. Enviamos el buffer
    res.send(buffer);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.reportesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReporteDto: UpdateReporteDto) {
  //   return this.reportesService.update(+id, updateReporteDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.reportesService.remove(+id);
  // }
}
