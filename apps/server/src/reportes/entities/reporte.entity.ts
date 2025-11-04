import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

  // --- Relaciones ---
  @Column()
  Usuario_idUsers: number;

  @ManyToOne(() => User, (usuario) => usuario.reportes, { nullable: false })
  @JoinColumn({ name: 'Usuario_idUsers' }) // Especifica la FK
  usuario: User;

  @OneToMany(() => Poliza, (poliza) => poliza.reporte)
  polizas: Poliza[];
}