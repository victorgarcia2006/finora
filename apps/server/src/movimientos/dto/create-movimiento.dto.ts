import { IsNumber, IsPositive, Min, IsDefined, IsInt } from 'class-validator';

export class CreateMovimientoDto {
  @IsNumber()
  @Min(0)
  debe: number;

  @IsNumber()
  @Min(0)
  haber: number;

  @IsDefined()
  @IsInt()
  @IsPositive()
  idCuenta: number;
}
