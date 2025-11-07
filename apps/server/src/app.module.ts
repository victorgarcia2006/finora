import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { PolizasModule } from './polizas/polizas.module';
import { CuentasModule } from './cuentas/cuentas.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { ReportesModule } from './reportes/reportes.module';
import { Poliza } from './polizas/entities/poliza.entity';
import { Reporte } from './reportes/entities/reporte.entity';
import { Movimiento } from './movimientos/entities/movimiento.entity';
import { Cuenta } from './cuentas/entities/cuenta.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DB_URL'),
        ssl: { rejectUnauthorized: false },
        entities: [User, Poliza, Reporte, Movimiento, Cuenta], 
        synchronize: true, 
      }),
    }),
    AuthModule,
    UsersModule,
    PolizasModule,
    CuentasModule,
    MovimientosModule,
    ReportesModule,
  ],
})
export class AppModule {}
