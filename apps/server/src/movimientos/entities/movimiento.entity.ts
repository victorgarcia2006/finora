import { Cuenta } from "src/cuentas/entities/cuenta.entity";
import { Poliza } from "src/polizas/entities/poliza.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('movimientos')
export class Movimiento {
  @PrimaryGeneratedColumn()
  idMovimientos: number;
  
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0.0 })
  debe: number; 

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0.0 })
  haber: number;

  // Relaciones
  @Column()
  Poliza_idPoliza: number;

  @Column()
  Cuenta_idCuenta: number;

  @ManyToOne(() => Poliza, (poliza) => poliza.movimientos, { nullable: false, onDelete: 'CASCADE' }) // Si se borra la póliza, se borran sus movimientos
  @JoinColumn({ name: 'Poliza_idPoliza' })
  poliza: Poliza;

  @ManyToOne(() => Cuenta, (cuenta) => cuenta.movimientos, { nullable: false })
  @JoinColumn({ name: 'Cuenta_idCuenta' })
  cuenta: Cuenta;
}