
import { 
  Column, 
  Entity, 
  JoinColumn, 
  ManyToOne, 
  OneToMany, 
  PrimaryGeneratedColumn 
} from "typeorm";
import { TipoReporte } from "../enums/tipo-reporte.enum";
import { User } from "src/users/entities/user.entity";
import { Poliza } from "src/polizas/entities/poliza.entity";

@Entity('reporte')
export class Reporte {
  @PrimaryGeneratedColumn()
  idReporte: number;

  @Column({
    type: 'enum',
    enum: TipoReporte,
  })
  tipo: TipoReporte;

  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'date' })
  fechaFin: Date;

  // --- ¡NUEVA COLUMNA! ---
  // Aquí guardaremos el JSON del reporte
  // 'jsonb' es un tipo de dato de Postgres, muy eficiente
  @Column({ type: 'jsonb' })
  data: any;

  // --- Relaciones ---
  @Column()
  Usuario_idUsers: string;

  @ManyToOne(() => User, (usuario) => usuario.reportes, { nullable: false })
  @JoinColumn({ name: 'Usuario_idUsers' })
  usuario: User;

  @OneToMany(() => Poliza, (poliza) => poliza.reporte)
  polizas: Poliza[];
}