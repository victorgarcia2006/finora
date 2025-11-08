import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movimiento } from 'src/movimientos/entities/movimiento.entity';
import { Repository } from 'typeorm';
import { TipoCuenta } from 'src/cuentas/enums/tipo-cuenta.enum';
import { NaturalezaCuenta } from 'src/cuentas/enums/naturaleza-cuenta.enum';
import { ClasificacionCuenta } from 'src/cuentas/enums/clasificacion-cuenta.enum';
import { Reporte } from './entities/reporte.entity';
import { TipoReporte } from './enums/tipo-reporte.enum';
import * as ExcelJS from 'exceljs';

export interface CuentaConSaldo {
  idCuenta: number;
  codigoCuenta: string;
  nombre: string;
  saldoFinal: number;
}

export interface SubCategoria {
  cuentas: CuentaConSaldo[];
  total: number;
}

@Injectable()
export class ReportesService {

  constructor(
    @InjectRepository(Movimiento)
    private movimientoRepository: Repository<Movimiento>,

    @InjectRepository(Reporte)
    private reporteRepository: Repository<Reporte>,
  ) { }

  async findAll(usuarioId: string): Promise<Reporte[]> {
    return this.reporteRepository.find({
      where: { Usuario_idUsers: usuarioId },
      order: { fechaFin: 'DESC' },
      // Omitimos la columna 'data' (que tiene el JSON pesado)
      // para que la lista sea ligera.
      select: ['idReporte', 'tipo', 'fechaInicio', 'fechaFin']
    });
  }

  async findOne(usuarioId: string, reporteId: number): Promise<Reporte> {
    const reporte = await this.reporteRepository.findOneBy({
      idReporte: reporteId,
      Usuario_idUsers: usuarioId,
    });

    if (!reporte) {
      throw new NotFoundException(
        'Reporte no encontrado o no te pertenece.',
      );
    }

    return reporte;
  }

  async generarBalanceGeneral(
    usuarioId: string,
    dto: GenerarReporteDto,
  ) {
    const { fechaFin } = dto;

    // 1. Obtenemos los saldos SOLO de cuentas de Balance
    const saldos = await this.getSaldosAgrupados(
      usuarioId,
      fechaFin,
      [
        TipoCuenta.ACTIVO,
        TipoCuenta.PASIVO,
        TipoCuenta.CAPITAL,
      ],
    );

    // 2. Definimos la estructura jerárquica
    const reporte = {
      activo: {
        circulante: { cuentas: [], total: 0 } as SubCategoria,
        fijo: { cuentas: [], total: 0 } as SubCategoria,
        diferido: { cuentas: [], total: 0 } as SubCategoria,
        total: 0,
      },
      pasivo: {
        cortoPlazo: { cuentas: [], total: 0 } as SubCategoria,
        largoPlazo: { cuentas: [], total: 0 } as SubCategoria,
        diferido: { cuentas: [], total: 0 } as SubCategoria,
        total: 0,
      },
      capitalContable: {
        cuentas: [] as CuentaConSaldo[],
        total: 0,
      },
    };

    // 3. Clasificamos cada cuenta
    for (const cuenta of saldos) {
      const saldoFinal = this.calcularSaldo(
        cuenta.naturaleza,
        cuenta.totalDebe,
        cuenta.totalHaber,
      );

      if (saldoFinal === 0) continue;

      const cuentaConSaldo: CuentaConSaldo = {
        idCuenta: cuenta.idCuenta,
        codigoCuenta: cuenta.codigoCuenta,
        nombre: cuenta.nombre,
        saldoFinal: saldoFinal,
      };

      switch (cuenta.clasificacion) {
        // ACTIVOS
        case ClasificacionCuenta.ACTIVO_CIRCULANTE:
          reporte.activo.circulante.cuentas.push(cuentaConSaldo);
          reporte.activo.circulante.total += saldoFinal;
          break;
        case ClasificacionCuenta.ACTIVO_FIJO:
          reporte.activo.fijo.cuentas.push(cuentaConSaldo);
          reporte.activo.fijo.total += saldoFinal;
          break;
        case ClasificacionCuenta.ACTIVO_DIFERIDO:
          reporte.activo.diferido.cuentas.push(cuentaConSaldo);
          reporte.activo.diferido.total += saldoFinal;
          break;
        // PASIVOS
        case ClasificacionCuenta.PASIVO_CORTO_PLAZO:
          reporte.pasivo.cortoPlazo.cuentas.push(cuentaConSaldo);
          reporte.pasivo.cortoPlazo.total += saldoFinal;
          break;
        case ClasificacionCuenta.PASIVO_LARGO_PLAZO:
          reporte.pasivo.largoPlazo.cuentas.push(cuentaConSaldo);
          reporte.pasivo.largoPlazo.total += saldoFinal;
          break;
        case ClasificacionCuenta.PASIVO_DIFERIDO:
          reporte.pasivo.diferido.cuentas.push(cuentaConSaldo);
          reporte.pasivo.diferido.total += saldoFinal;
          break;
        // CAPITAL
        case ClasificacionCuenta.CAPITAL:
          reporte.capitalContable.cuentas.push(cuentaConSaldo);
          reporte.capitalContable.total += saldoFinal;
          break;
      }
    }

    // 4. Totalizamos
    reporte.activo.total =
      reporte.activo.circulante.total +
      reporte.activo.fijo.total +
      reporte.activo.diferido.total;

    reporte.pasivo.total =
      reporte.pasivo.cortoPlazo.total +
      reporte.pasivo.largoPlazo.total +
      reporte.pasivo.diferido.total;

    // 5. Creamos el objeto final de datos
    const totalPasivoMasCapital = reporte.pasivo.total + reporte.capitalContable.total;
    const reporteFinal = {
      reporte: 'Balance General',
      fechaCorte: fechaFin,
      ...reporte,
      verificacion: {
        totalActivo: reporte.activo.total,
        totalPasivoMasCapital: totalPasivoMasCapital,
        diferencia: reporte.activo.total - totalPasivoMasCapital,
      },
    };

    const nuevoReporte = this.reporteRepository.create({
      tipo: TipoReporte.BALANCE_GENERAL,
      fechaInicio: null, // El balance es a una fecha de corte
      fechaFin: fechaFin,
      Usuario_idUsers: usuarioId,
      data: reporteFinal, // Guardamos el JSON calculado
    });

    await this.reporteRepository.save(nuevoReporte);

    return nuevoReporte; // Devolvemos el reporte guardado
  }

  async generarEstadoResultados(
    usuarioId: string,
    dto: GenerarReporteDto,
  ) {
    // 1. Obtenemos los datos del DTO
    const { fechaInicio, fechaFin } = dto;

    // 2. Validamos que tengamos un rango de fechas
    if (!fechaInicio) {
      throw new BadRequestException(
        'La fechaInicio es requerida para el Estado de Resultados.',
      );
    }

    // 3. Obtenemos saldos SOLO del periodo y SOLO de cuentas de resultados
    const saldos = await this.getSaldosAgrupados(
      usuarioId,
      fechaFin,
      [TipoCuenta.INGRESO, TipoCuenta.COSTO, TipoCuenta.GASTO],
      fechaInicio,
    );

    // 4. Procesamos y separamos
    const ingresos = [];
    const costos = [];
    const gastos = [];
    let totalIngresos = 0;
    let totalCostos = 0;
    let totalGastos = 0;

    for (const cuenta of saldos) {
      const saldoFinal = this.calcularSaldo(
        cuenta.naturaleza,
        cuenta.totalDebe,
        cuenta.totalHaber,
      );

      if (saldoFinal !== 0) {
        const cuentaConSaldo: CuentaConSaldo = {
          idCuenta: cuenta.idCuenta,
          codigoCuenta: cuenta.codigoCuenta,
          nombre: cuenta.nombre,
          saldoFinal: saldoFinal,
        };

        if (cuenta.tipo_cuenta === TipoCuenta.INGRESO) {
          ingresos.push(cuentaConSaldo);
          totalIngresos += saldoFinal;
        } else if (cuenta.tipo_cuenta === TipoCuenta.COSTO) {
          costos.push(cuentaConSaldo);
          totalCostos += saldoFinal;
        } else if (cuenta.tipo_cuenta === TipoCuenta.GASTO) {
          gastos.push(cuentaConSaldo);
          totalGastos += saldoFinal;
        }
      }
    }

    // 5. Calculamos los totales del reporte
    const utilidadBruta = totalIngresos - totalCostos;
    const utilidadNeta = utilidadBruta - totalGastos;

    // 6. Creamos el objeto JSON final
    const reporteFinal = {
      reporte: 'Estado de Resultados',
      periodoDel: fechaInicio,
      periodoAl: fechaFin,
      ingresos: {
        cuentas: ingresos,
        totalIngresos: totalIngresos,
      },
      costos: {
        cuentas: costos,
        totalCostos: totalCostos,
      },
      utilidadBruta: utilidadBruta,
      gastos: {
        cuentas: gastos,
        totalGastos: totalGastos,
      },
      utilidadNeta: utilidadNeta,
    };

    // 7. Creamos la entidad Reporte
    const nuevoReporte = this.reporteRepository.create({
      tipo: TipoReporte.ESTADO_RESULTADOS,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      Usuario_idUsers: usuarioId,
      data: reporteFinal, // Guardamos el JSON calculado
    });

    // 8. Guardamos en la base de datos
    await this.reporteRepository.save(nuevoReporte);

    // 9. Devolvemos el reporte guardado
    return nuevoReporte;
  }

  async exportarExcel(usuarioId: string, reporteId: number) {
    // 1. Obtener los datos del reporte
    const reporte = await this.findOne(usuarioId, reporteId);
    const data = reporte.data; // El JSON guardado

    // 2. Crear el libro de trabajo (Workbook)
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Finora App';
    workbook.created = new Date();

    let fileName = 'reporte.xlsx';

    // 3. Construir la hoja de cálculo según el tipo de reporte
    if (reporte.tipo === TipoReporte.BALANCE_GENERAL) {
      fileName = `Balance-General-${reporte.idReporte}.xlsx`;
      const worksheet = workbook.addWorksheet('Balance General');
      this.buildBalanceSheetExcel(worksheet, data, reporte.fechaFin);
    } else {
      fileName = `Estado-Resultados-${reporte.idReporte}.xlsx`;
      const worksheet = workbook.addWorksheet('Estado de Resultados');
      this.buildIncomeStatementExcel(
        worksheet,
        data,
        reporte.fechaInicio,
        reporte.fechaFin,
      );
    }

    // 4. Generar el buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer, fileName };
  }

  private async getSaldosAgrupados(
    usuarioId: string,
    fechaFin: Date,
    tiposDeCuenta: TipoCuenta[],
    fechaInicio?: Date,
  ) {
    const qb = this.movimientoRepository.createQueryBuilder('mov');

    qb.select('cuenta.idCuenta', 'idCuenta')
      .addSelect('cuenta.Cuenta_idCuenta', 'codigoCuenta')
      .addSelect('cuenta.nombre', 'nombre')
      .addSelect('cuenta.naturaleza', 'naturaleza')
      .addSelect('cuenta.tipo_cuenta', 'tipo_cuenta')
      .addSelect('cuenta.clasificacion', 'clasificacion') // <-- AÑADIDO
      .addSelect('SUM(COALESCE(mov.debe, 0))', 'totalDebe')
      .addSelect('SUM(COALESCE(mov.haber, 0))', 'totalHaber')
      .innerJoin('mov.poliza', 'poliza')
      .innerJoin('mov.cuenta', 'cuenta')
      .groupBy('cuenta.idCuenta')
      .where('poliza.Usuario_idUsers = :usuarioId', { usuarioId })
      .andWhere('cuenta.tipo_cuenta IN (:...tiposDeCuenta)', {
        tiposDeCuenta,
      })
      .andWhere('poliza.fecha <= :fechaFin', { fechaFin });

    if (fechaInicio) {
      qb.andWhere('poliza.fecha >= :fechaInicio', { fechaInicio });
    }

    const resultados = await qb.getRawMany();

    return resultados.map(r => ({
      ...r,
      totalDebe: parseFloat(r.totalDebe),
      totalHaber: parseFloat(r.totalHaber),
    }));
  }

  private calcularSaldo(
    naturaleza: NaturalezaCuenta,
    totalDebe: number,
    totalHaber: number,
  ): number {
    if (naturaleza === NaturalezaCuenta.DEUDORA) {
      return totalDebe - totalHaber;
    } else {
      return totalHaber - totalDebe;
    }
  }

  private buildBalanceSheetExcel(
    worksheet: ExcelJS.Worksheet,
    data: any,
    fechaFin: Date,
  ) {
    // Estilos
    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    };
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 14 },
    };
    const subHeaderStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, italic: true },
    };
    const totalStyle: Partial<ExcelJS.Style> = {
      font: { bold: true },
      border: { top: { style: 'thin' } },
      numFmt: '$#,##0.00',
    };
    const accountStyle: Partial<ExcelJS.Style> = {
      numFmt: '$#,##0.00',
    };

    // Configurar columnas
    worksheet.columns = [
      { key: 'A', width: 5 },
      { key: 'B', width: 30 },
      { key: 'C', width: 18 },
      { key: 'D', width: 18 },
    ];

    let row = 1;

    // Título
    worksheet.mergeCells(`A${row}:D${row}`);
    worksheet.getCell(`A${row}`).value = 'Balance General';
    worksheet.getCell(`A${row}`).style = titleStyle;
    row++;
    worksheet.mergeCells(`A${row}:D${row}`);
    worksheet.getCell(`A${row}`).value = `Al ${new Date(fechaFin).toLocaleDateString()}`;
    worksheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
    row++; row++; // Espacio

    // --- ACTIVO ---
    worksheet.getCell(`A${row}`).value = 'Activo';
    worksheet.getCell(`A${row}`).style = headerStyle;
    row++;

    // Helper para imprimir una sub-categoría de activo/pasivo
    const printSubCategory = (catData: SubCategoria, name: string) => {
      if (catData.cuentas.length > 0) {
        worksheet.getCell(`B${row}`).value = name;
        worksheet.getCell(`B${row}`).style = subHeaderStyle;
        row++;
        catData.cuentas.forEach(c => {
          worksheet.getCell(`B${row}`).value = c.nombre;
          worksheet.getCell(`C${row}`).value = c.saldoFinal;
          worksheet.getCell(`C${row}`).style = accountStyle;
          row++;
        });
        worksheet.getCell(`D${row - 1}`).value = catData.total;
        worksheet.getCell(`D${row - 1}`).style = totalStyle;
      }
    };

    printSubCategory(data.activo.circulante, 'Circulante');
    printSubCategory(data.activo.fijo, 'Fijo');
    printSubCategory(data.activo.diferido, 'Diferido');
    worksheet.getCell(`C${row}`).value = 'Total Activo';
    worksheet.getCell(`D${row}`).value = data.activo.total;
    worksheet.getCell(`C${row}`).style = totalStyle;
    worksheet.getCell(`D${row}`).style = totalStyle;
    row++; row++; // Espacio

    // --- PASIVO ---
    worksheet.getCell(`A${row}`).value = 'Pasivo';
    worksheet.getCell(`A${row}`).style = headerStyle;
    row++;
    printSubCategory(data.pasivo.cortoPlazo, 'Circulante');
    printSubCategory(data.pasivo.largoPlazo, 'Fijo');
    printSubCategory(data.pasivo.diferido, 'Diferido');
    worksheet.getCell(`C${row}`).value = 'Total Pasivo';
    worksheet.getCell(`D${row}`).value = data.pasivo.total;
    worksheet.getCell(`C${row}`).style = totalStyle;
    worksheet.getCell(`D${row}`).style = totalStyle;
    row++; row++; // Espacio

    // --- CAPITAL ---
    worksheet.getCell(`A${row}`).value = 'Capital Contable';
    worksheet.getCell(`A${row}`).style = headerStyle;
    row++;
    data.capitalContable.cuentas.forEach(c => {
      worksheet.getCell(`B${row}`).value = c.nombre;
      worksheet.getCell(`C${row}`).value = c.saldoFinal;
      worksheet.getCell(`C${row}`).style = accountStyle;
      row++;
    });
    worksheet.getCell(`C${row}`).value = 'Total Capital';
    worksheet.getCell(`D${row}`).value = data.capitalContable.total;
    worksheet.getCell(`C${row}`).style = totalStyle;
    worksheet.getCell(`D${row}`).style = totalStyle;
  }

  private buildIncomeStatementExcel(
    worksheet: ExcelJS.Worksheet,
    data: any,
    fechaInicio: Date,
    fechaFin: Date,
  ) {
    // Estilos
    const titleStyle: Partial<ExcelJS.Style> = { font: { bold: true, size: 16 }, alignment: { horizontal: 'center' } };
    const periodStyle: Partial<ExcelJS.Style> = { alignment: { horizontal: 'center' } };
    const headerStyle: Partial<ExcelJS.Style> = { font: { bold: true, size: 14 } };
    const totalStyle: Partial<ExcelJS.Style> = { font: { bold: true }, border: { top: { style: 'thin' } }, numFmt: '$#,##0.00' };
    const finalTotalStyle: Partial<ExcelJS.Style> = { font: { bold: true, size: 12 }, border: { top: { style: 'double' } }, numFmt: '$#,##0.00' };
    const accountStyle: Partial<ExcelJS.Style> = { numFmt: '$#,##0.00' };

    // Configurar columnas
    worksheet.columns = [
      { key: 'A', width: 35 },
      { key: 'B', width: 20 },
    ];

    let row = 1;

    // Título
    worksheet.mergeCells(`A${row}:B${row}`);
    worksheet.getCell(`A${row}`).value = 'Estado de Resultados';
    worksheet.getCell(`A${row}`).style = titleStyle;
    row++;
    worksheet.mergeCells(`A${row}:B${row}`);
    worksheet.getCell(`A${row}`).value = `Del ${new Date(fechaInicio).toLocaleDateString()} al ${new Date(fechaFin).toLocaleDateString()}`;
    worksheet.getCell(`A${row}`).style = periodStyle;
    row++; row++; // Espacio

    // Ingresos
    worksheet.getCell(`A${row}`).value = 'Ingresos';
    worksheet.getCell(`A${row}`).style = headerStyle;
    row++;
    data.ingresos.cuentas.forEach(c => {
      worksheet.getCell(`A${row}`).value = c.nombre;
      worksheet.getCell(`B${row}`).value = c.saldoFinal;
      worksheet.getCell(`B${row}`).style = accountStyle;
      row++;
    });
    worksheet.getCell(`A${row}`).value = 'Total Ingresos';
    worksheet.getCell(`B${row}`).value = data.ingresos.totalIngresos;
    worksheet.getCell(`A${row}`).style = totalStyle;
    worksheet.getCell(`B${row}`).style = totalStyle;
    row++; row++; // Espacio

    // Costos
    worksheet.getCell(`A${row}`).value = 'Costos';
    worksheet.getCell(`A${row}`).style = headerStyle;
    row++;
    data.costos.cuentas.forEach(c => {
      worksheet.getCell(`A${row}`).value = c.nombre;
      worksheet.getCell(`B${row}`).value = c.saldoFinal;
      worksheet.getCell(`B${row}`).style = accountStyle;
      row++;
    });
    worksheet.getCell(`A${row}`).value = 'Total Costos';
    worksheet.getCell(`B${row}`).value = data.costos.totalCostos;
    worksheet.getCell(`A${row}`).style = totalStyle;
    worksheet.getCell(`B${row}`).style = totalStyle;
    row++;

    // Utilidad Bruta
    worksheet.getCell(`A${row}`).value = 'Utilidad Bruta';
    worksheet.getCell(`B${row}`).value = data.utilidadBruta;
    worksheet.getCell(`A${row}`).style = totalStyle;
    worksheet.getCell(`B${row}`).style = totalStyle;
    row++; row++; // Espacio

    // Gastos
    worksheet.getCell(`A${row}`).value = 'Gastos';
    worksheet.getCell(`A${row}`).style = headerStyle;
    row++;
    data.gastos.cuentas.forEach(c => {
      worksheet.getCell(`A${row}`).value = c.nombre;
      worksheet.getCell(`B${row}`).value = c.saldoFinal;
      worksheet.getCell(`B${row}`).style = accountStyle;
      row++;
    });
    worksheet.getCell(`A${row}`).value = 'Total Gastos';
    worksheet.getCell(`B${row}`).value = data.gastos.totalGastos;
    worksheet.getCell(`A${row}`).style = totalStyle;
    worksheet.getCell(`B${row}`).style = totalStyle;
    row++;

    // Utilidad Neta
    worksheet.getCell(`A${row}`).value = 'Utilidad Neta';
    worksheet.getCell(`B${row}`).value = data.utilidadNeta;
    worksheet.getCell(`A${row}`).style = finalTotalStyle;
    worksheet.getCell(`B${row}`).style = finalTotalStyle;
  }
}
