import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional } from "class-validator";

export class GenerarReporteDto {

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  fechaFin: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fechaInicio?: Date;
}
