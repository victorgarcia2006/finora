import { IsString, IsNotEmpty, IsDate, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMovimientoDto } from 'src/movimientos/dto/create-movimiento.dto';

export class CreatePolizaDto {
  @IsDate()
  @Type(() => Date)
  fecha: Date;

  @IsString()
  @IsNotEmpty()
  concepto: string;

  // Validación de la partida doble (mínimo 2 movimientos)
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateMovimientoDto)
  movimientos: CreateMovimientoDto[];
}