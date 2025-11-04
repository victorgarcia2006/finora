import { Movimiento } from "src/movimientos/entities/movimiento.entity";
import { Reporte } from "src/reportes/entities/reporte.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('poliza')
export class Poliza {
  @PrimaryGeneratedColumn()
  idPoliza: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'varchar', length: 45 })
  concepto: string;

  // Relaciones
  @Column()
  Usuario_idUsers: string;

  @Column({ nullable: true }) 
  Reporte_idReporte: number;

  @ManyToOne(() => User, (usuario) => usuario.polizas, { nullable: false })
  @JoinColumn({ name: 'Usuario_idUsers' })
  usuario: User;

  @ManyToOne(() => Reporte, (reporte) => reporte.polizas, { nullable: true })
  @JoinColumn({ name: 'Reporte_idReporte' })
  reporte: Reporte;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.poliza, {
    cascade: true,
  })
  movimientos: Movimiento[];
}