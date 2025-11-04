import { Module } from '@nestjs/common';
import { PolizasService } from './polizas.service';
import { PolizasController } from './polizas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poliza } from './entities/poliza.entity';
import { Movimiento } from 'src/movimientos/entities/movimiento.entity';
import { Cuenta } from 'src/cuentas/entities/cuenta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Poliza, 
      Movimiento,
      Cuenta,  
    ]),
  ],
  controllers: [PolizasController],
  providers: [PolizasService],
})
export class PolizasModule {}
