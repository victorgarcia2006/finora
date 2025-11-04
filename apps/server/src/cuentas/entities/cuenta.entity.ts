import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TipoCuenta } from "../enums/tipo-cuenta.enum";
import { NaturalezaCuenta } from "../enums/naturaleza-cuenta.enum";
import { User } from "src/users/entities/user.entity";
import { Movimiento } from "src/movimientos/entities/movimiento.entity";


@Entity('cuenta')
export class Cuenta {
  @PrimaryGeneratedColumn()
  idCuenta: number;

  @Column({ type: 'varchar', length: 45, unique: true }) 
  Cuenta_idCuenta: string; 

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'enum', enum: TipoCuenta })
  tipo_cuenta: TipoCuenta;

  @Column({ type: 'enum', enum: NaturalezaCuenta })
  naturaleza: NaturalezaCuenta;

  // Relaciones
  @OneToMany(() => Movimiento, (movimiento) => movimiento.cuenta)
  movimientos: Movimiento[];
}