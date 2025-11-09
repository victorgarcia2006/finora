import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePolizaDto } from './dto/create-poliza.dto';
import { UpdatePolizaDto } from './dto/update-poliza.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Poliza } from './entities/poliza.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Cuenta } from 'src/cuentas/entities/cuenta.entity';
import { User } from 'src/users/entities/user.entity';
import { Movimiento } from 'src/movimientos/entities/movimiento.entity';

@Injectable()
export class PolizasService {

  constructor(
    @InjectRepository(Poliza)
    private polizaRepository: Repository<Poliza>,
    @InjectRepository(Cuenta)
    private cuentaRepository: Repository<Cuenta>,
    private dataSource: DataSource, // Inyectamos DataSource para la transacción
  ) { }
  
  async create(createPolizaDto: CreatePolizaDto, usuarioId: string): Promise<Poliza> {
    const { movimientos, ...polizaData } = createPolizaDto;

    // Validación de Partida Doble (Sumas Iguales) 
    const totalDebe = movimientos.reduce((sum, m) => sum + Number(m.debe), 0);
    const totalHaber = movimientos.reduce((sum, m) => sum + Number(m.haber), 0);

    if (totalDebe !== totalHaber) throw new BadRequestException('La póliza no está cuadrada. El Debe y el Haber no coinciden.');
    
    if (totalDebe === 0) throw new BadRequestException('La póliza debe tener un valor.');

    // Validar que todas las cuentas existan 
    const cuentasIds = movimientos.map(m => m.idCuenta);
    const cuentasExistentes = await this.cuentaRepository.findBy({
      idCuenta: In(cuentasIds),
    });

    if (cuentasExistentes.length !== new Set(cuentasIds).size) {
      throw new NotFoundException('Una o más cuentas especificadas no existen.');
    }
    // Mapear IDs a entidades de Cuenta para la relación
    const cuentasMap = new Map(cuentasExistentes.map(c => [c.idCuenta, c]));


    // Iniciar Transacción 
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear y guardar la Póliza
      const nuevaPoliza = queryRunner.manager.create(Poliza, {
        ...polizaData,
        // Asignamos la FK directamente usando el ID
        Usuario_idUsers: usuarioId, 
      });
      await queryRunner.manager.save(nuevaPoliza);

      // Crear y guardar los Movimientos
      const movimientosEntidades = movimientos.map(dto => {
        return queryRunner.manager.create(Movimiento, {
          debe: dto.debe,
          haber: dto.haber,
          poliza: nuevaPoliza,
          cuenta: cuentasMap.get(dto.idCuenta),
        });
      });

      await queryRunner.manager.save(movimientosEntidades);

      // Confirmar Transacción
      await queryRunner.commitTransaction();

      // Devolvemos la póliza
      return nuevaPoliza;

    } catch (err) {
      // Revertir Transacción en caso de error
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Error al crear la póliza: ${err.message}`);
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async findAll(usuarioId: string): Promise<Poliza[]> {
    return this.polizaRepository.find({
      where: { Usuario_idUsers: usuarioId }, // Filtra por el ID
      relations: ['movimientos', 'movimientos.cuenta'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Poliza> {
    return await this.polizaRepository.findOne({
      where: { idPoliza: id },
      relations: ['movimientos', 'movimientos.cuenta'],
    });
  }

  

}
