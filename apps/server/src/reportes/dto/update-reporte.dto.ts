import { PartialType } from '@nestjs/mapped-types';
import { GenerarReporteDto } from './generar-reporte.dto';

export class UpdateReporteDto extends PartialType(GenerarReporteDto) {}
