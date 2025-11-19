import React from "react";
import { Table, ScrollArea, Loader } from "@mantine/core";
import { getOneReporte } from "../pages/api/reportes";

interface TableBalanceProps {
  id: number;
}

function TableBalance({ id }: TableBalanceProps) {
  const [reporte, setReporte] = React.useState({});
  React.useEffect(() => {
    getOneReporte(id).then((reporte) => {
      setReporte(reporte);
    });
  }, [id, getOneReporte, setReporte]);

  return (
    <ScrollArea h="520px">
     {reporte === null || reporte.data === undefined ? (
        <Loader />
     ) : (
         <Table withTableBorder className="text-white">
        <Table.Tr>
          <Table.Th>Cuenta</Table.Th>
          <Table.Th>Monto</Table.Th>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold text-lg">Activos</Table.Td>
        </Table.Tr>
        <Table.Tr
          className={
            reporte.data.activo.fijo.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-semibold">Activos Fijos</Table.Td>
        </Table.Tr>
        {reporte && reporte.data.activo.fijo.cuentas.map((cuenta: any) => (
          <Table.Tr key={cuenta.idCuenta}>
            <Table.Td>{cuenta.nombre}</Table.Td>
            <Table.Td>${cuenta.saldoFinal}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr
          className={
            reporte.data.activo.fijo.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-bold text-lg">Total Activos Fijos</Table.Td>
          <Table.Td>${reporte.data.activo.fijo.total}</Table.Td>
        </Table.Tr>
        <Table.Tr
          className={
            reporte.data.activo.diferido.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-semibold">Activos Diferidos</Table.Td>
        </Table.Tr>
        {reporte && reporte.data.activo.diferido.cuentas.map((cuenta: any) => (
          <Table.Tr key={cuenta.idCuenta}>
            <Table.Td>{cuenta.nombre}</Table.Td>
            <Table.Td>${cuenta.saldoFinal}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr
          className={
            reporte.data.activo.diferido.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-bold">Total Activos Diferidos</Table.Td>
          <Table.Td>${reporte.data.activo.diferido.total}</Table.Td>
        </Table.Tr>
        <Table.Tr
          className={
            reporte.data.activo.circulante.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-semibold">Activos Circulantes</Table.Td>
        </Table.Tr>
        {reporte && reporte.data.activo.circulante.cuentas.map((cuenta: any) => (
          <Table.Tr key={cuenta.idCuenta}>
            <Table.Td>{cuenta.nombre}</Table.Td>
            <Table.Td>${cuenta.saldoFinal}</Table.Td>
          </Table.Tr>
        ))}

        <Table.Tr
          className={
            reporte.data.activo.circulante.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-bold">Total Activos Circulantes</Table.Td>
          <Table.Td>${reporte.data.activo.circulante.total}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold">Total Activos</Table.Td>
          <Table.Td>${reporte.data.activo.total}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold text-lg">Pasivos</Table.Td>
        </Table.Tr>
        <Table.Tr
          className={
            reporte.data.pasivo.cortoPlazo.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-semibold">Pasivos Fijos</Table.Td>
        </Table.Tr>
        {reporte && reporte.data.pasivo.cortoPlazo.cuentas.map((cuenta: any) => (
          <Table.Tr key={cuenta.idCuenta}>
            <Table.Td>{cuenta.nombre}</Table.Td>
            <Table.Td>${cuenta.saldoFinal}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr
          className={
            reporte.data.pasivo.cortoPlazo.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-bold">Total Pasivos Fijos</Table.Td>
          <Table.Td>${reporte.data.pasivo.cortoPlazo.total}</Table.Td>
        </Table.Tr>
        <Table.Tr
          className={
            reporte.data.pasivo.diferido.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-bold">Pasivos diferidos</Table.Td>
        </Table.Tr>
        {reporte && reporte.data.pasivo.diferido.cuentas.map((cuenta: any) => (
          <Table.Tr key={cuenta.idCuenta}>
            <Table.Td>{cuenta.nombre}</Table.Td>
            <Table.Td>${cuenta.saldoFinal}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr
          className={
            reporte.data.pasivo.diferido.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-bold">Total Pasivos Diferidos</Table.Td>
          <Table.Td>${reporte.data.pasivo.diferido.total}</Table.Td>
        </Table.Tr>
        <Table.Tr
          className={
            reporte.data.pasivo.largoPlazo.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-bold">Pasivos Circulantes</Table.Td>
        </Table.Tr>
        {reporte && reporte.data.pasivo.largoPlazo.cuentas.map((cuenta: any) => (
          <Table.Tr key={cuenta.idCuenta}>
            <Table.Td>{cuenta.nombre}</Table.Td>
            <Table.Td>${cuenta.saldoFinal}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr
          className={
            reporte.data.pasivo.largoPlazo.cuentas.length > 0 ? "" : "hidden"
          }
        >
          <Table.Td className="font-bold">Total Pasivos Circulantes</Table.Td>
          <Table.Td>${reporte.data.pasivo.largoPlazo.total}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold">Total Pasivos</Table.Td>
          <Table.Td>${reporte.data.pasivo.total}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold text-lg">Capital Contable</Table.Td>
        </Table.Tr>
        {reporte && reporte.data.capitalContable.cuentas.map((cuenta: any) => (
          <Table.Tr key={cuenta.idCuenta}>
            <Table.Td>{cuenta.nombre}</Table.Td>
            <Table.Td>${cuenta.saldoFinal}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr>
          <Table.Td className="font-bold">Total Capital Contable</Table.Td>
          <Table.Td>${reporte.data.capitalContable.total}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold">
            Total Pasivo mas Capital Contable
          </Table.Td>
          <Table.Td>${reporte.data.verificacion.totalPasivoMasCapital}</Table.Td>
        </Table.Tr>
      </Table>
     )}
    </ScrollArea>
  );
}

export default TableBalance;
