import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Poliza } from 'src/polizas/entities/poliza.entity';
import { Reporte } from 'src/reportes/entities/reporte.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Poliza, Reporte]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
