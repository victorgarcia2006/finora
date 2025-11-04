import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cuenta } from './entities/cuenta.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { TipoCuenta } from './enums/tipo-cuenta.enum';
import { NaturalezaCuenta } from './enums/naturaleza-cuenta.enum';

@Injectable()
export class CuentasService {
  private readonly logger = new Logger(CuentasService.name);

  constructor(
    @InjectRepository(Cuenta)
    private cuentaRepository: Repository<Cuenta>,
    @InjectRepository(User)
    private usuarioRepository: Repository<User>,
  ) { }

  async onModuleInit() {
    await this.seedCuentas();
  }

  private async seedCuentas() {
    this.logger.log('Verificando cuentas iniciales...');
    const count = await this.cuentaRepository.count();

    if (count > 0) {
      this.logger.log('Las cuentas ya existen. Se omite el seeding.');
      return;
    }

    this.logger.log('No hay cuentas. Creando catálogo inicial...');


    const catalogoCuentas = [

      // 1. ACTIVO 
      // 1.1 Activo Circulante
      { Cuenta_idCuenta: '1101', nombre: 'Caja', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1102', nombre: 'Bancos', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1103', nombre: 'Inversiones temporales', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1104', nombre: 'Mercancías (Inventarios)', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1105', nombre: 'Clientes', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1106', nombre: 'Documentos por cobrar', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1107', nombre: 'Deudores diversos', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1108', nombre: 'Anticipo a proveedores', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },

      // 1.2 Activo No Circulante (Fijo)
      { Cuenta_idCuenta: '1201', nombre: 'Terrenos', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1202', nombre: 'Edificios', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1203', nombre: 'Mobiliario y equipo', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1204', nombre: 'Equipo de cómputo electrónico', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1205', nombre: 'Equipo de entrega o de reparto', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1206', nombre: 'Depósitos en garantía', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1207', nombre: 'Inversiones permanentes', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },

      // 1.3 Otros Activos (Intangibles y Diferidos)
      { Cuenta_idCuenta: '1901', nombre: 'Gastos de investigación y desarrollo', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1902', nombre: 'Gastos en etapas preoperativas', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1903', nombre: 'Gastos de mercadotecnia (diferido)', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1904', nombre: 'Gastos de organización', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1905', nombre: 'Gastos de instalación', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1906', nombre: 'Papelería y útiles (almacén)', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1907', nombre: 'Propaganda y publicidad (pagada por anticipado)', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1908', nombre: 'Primas de seguros (pagadas por anticipado)', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1909', nombre: 'Rentas pagadas por anticipado', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '1910', nombre: 'Intereses pagados por anticipado', tipo_cuenta: TipoCuenta.ACTIVO, naturaleza: NaturalezaCuenta.DEUDORA },

      // 2. PASIVO 
      // 2.1 Pasivo a Corto Plazo
      { Cuenta_idCuenta: '2101', nombre: 'Proveedores', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '2102', nombre: 'Documentos por pagar (CP)', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '2103', nombre: 'Acreedores diversos', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '2104', nombre: 'Anticipo de clientes', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '2105', nombre: 'Gastos pendientes de pago (acumulados)', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '2106', nombre: 'Impuestos pendientes de pago (acumulados)', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },

      // 2.2 Pasivo a Largo Plazo
      { Cuenta_idCuenta: '2201', nombre: 'Hipotecas por pagar (LP)', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '2202', nombre: 'Documentos por pagar (LP)', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '2203', nombre: 'Cuentas por pagar (LP)', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },

      // 2.3 Otros Pasivos (Diferidos)
      { Cuenta_idCuenta: '2901', nombre: 'Rentas cobradas por anticipado', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '2902', nombre: 'Intereses cobrados por anticipado', tipo_cuenta: TipoCuenta.PASIVO, naturaleza: NaturalezaCuenta.ACREEDORA },

      // 3. CAPITAL
      { Cuenta_idCuenta: '3101', nombre: 'Capital Social', tipo_cuenta: TipoCuenta.CAPITAL, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '3201', nombre: 'Utilidad del Ejercicio', tipo_cuenta: TipoCuenta.CAPITAL, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '3202', nombre: 'Utilidades Acumuladas', tipo_cuenta: TipoCuenta.CAPITAL, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '3203', nombre: 'Pérdida del Ejercicio', tipo_cuenta: TipoCuenta.CAPITAL, naturaleza: NaturalezaCuenta.DEUDORA }, // Excepción
      { Cuenta_idCuenta: '3204', nombre: 'Pérdidas Acumuladas', tipo_cuenta: TipoCuenta.CAPITAL, naturaleza: NaturalezaCuenta.DEUDORA }, // Excepción

      // 4. INGRESOS
      { Cuenta_idCuenta: '4101', nombre: 'Ventas', tipo_cuenta: TipoCuenta.INGRESO, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '4102', nombre: 'Ingresos por Servicios', tipo_cuenta: TipoCuenta.INGRESO, naturaleza: NaturalezaCuenta.ACREEDORA },
      { Cuenta_idCuenta: '4103', nombre: 'Devoluciones sobre Venta', tipo_cuenta: TipoCuenta.INGRESO, naturaleza: NaturalezaCuenta.DEUDORA }, // Excepción
      { Cuenta_idCuenta: '4201', nombre: 'Otros Ingresos (Productos Financieros)', tipo_cuenta: TipoCuenta.INGRESO, naturaleza: NaturalezaCuenta.ACREEDORA },

      // 5. COSTOS
      { Cuenta_idCuenta: '5101', nombre: 'Costo de Ventas', tipo_cuenta: TipoCuenta.COSTO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '5201', nombre: 'Costo de Servicios', tipo_cuenta: TipoCuenta.COSTO, naturaleza: NaturalezaCuenta.DEUDORA },

      // 6. GASTOS
      // 6.1 Gastos de Venta
      { Cuenta_idCuenta: '6101', nombre: 'Sueldos y Salarios (Ventas)', tipo_cuenta: TipoCuenta.GASTO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '6102', nombre: 'Comisiones (Ventas)', tipo_cuenta: TipoCuenta.GASTO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '6103', nombre: 'Publicidad y Propaganda (Gasto)', tipo_cuenta: TipoCuenta.GASTO, naturaleza: NaturalezaCuenta.DEUDORA },

      // 6.2 Gastos de Administración
      { Cuenta_idCuenta: '6201', nombre: 'Sueldos y Salarios (Admin)', tipo_cuenta: TipoCuenta.GASTO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '6202', nombre: 'Renta de Oficina', tipo_cuenta: TipoCuenta.GASTO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '6203', nombre: 'Papelería y Útiles (Gasto)', tipo_cuenta: TipoCuenta.GASTO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '6204', nombre: 'Servicios Públicos (Luz, Agua, Tel)', tipo_cuenta: TipoCuenta.GASTO, naturaleza: NaturalezaCuenta.DEUDORA },

      // 6.3 Gastos Financieros
      { Cuenta_idCuenta: '6301', nombre: 'Intereses a cargo (Gasto)', tipo_cuenta: TipoCuenta.GASTO, naturaleza: NaturalezaCuenta.DEUDORA },
      { Cuenta_idCuenta: '6302', nombre: 'Comisiones Bancarias', tipo_cuenta: TipoCuenta.GASTO, naturaleza: NaturalezaCuenta.DEUDORA },
    ];

    const cuentasACrear = catalogoCuentas.map(c => {
      return this.cuentaRepository.create({
        ...c,
      });
    });

    await this.cuentaRepository.save(cuentasACrear);
    this.logger.log(`¡Se crearon ${cuentasACrear.length} cuentas iniciales!`);
  }

  async findAll(tipoCuenta?: TipoCuenta): Promise<Cuenta[]> {
    const whereCondition: any = {};

    if (tipoCuenta) {
      // Validar que el tipoCuenta sea uno de los valores válidos del enum
      if (!Object.values(TipoCuenta).includes(tipoCuenta)) {
        throw new BadRequestException(`El tipo de cuenta '${tipoCuenta}' no es válido.`);
      }
      whereCondition.tipo_cuenta = tipoCuenta;
    }

    // Ordenamos por el código de la cuenta
    return this.cuentaRepository.find({
      where: whereCondition,
      order: {
        Cuenta_idCuenta: 'ASC'
      }
    });
  }
}
