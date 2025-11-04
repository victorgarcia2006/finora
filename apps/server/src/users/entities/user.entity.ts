import { Cuenta } from "src/cuentas/entities/cuenta.entity";
import { Poliza } from "src/polizas/entities/poliza.entity";
import { Reporte } from "src/reportes/entities/reporte.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column()
    empresa: string;

    // Relaciones
    @OneToMany(() => Poliza, (poliza) => poliza.usuario)
    polizas: Poliza[];

    @OneToMany(() => Reporte, (reporte) => reporte.usuario)
    reportes: Reporte[];
}
