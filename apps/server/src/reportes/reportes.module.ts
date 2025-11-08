import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reporte } from './entities/reporte.entity';
import { Movimiento } from 'src/movimientos/entities/movimiento.entity';
import { Cuenta } from 'src/cuentas/entities/cuenta.entity';
import { Poliza } from 'src/polizas/entities/poliza.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reporte,      
      Movimiento,   
      Cuenta,  
      Poliza,     
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
