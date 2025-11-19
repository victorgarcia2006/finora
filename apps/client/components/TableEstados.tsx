import React from "react";
import { ScrollArea, Table } from "@mantine/core";
import { getOneReporte } from "../pages/api/reportes";

interface TableEstadosProps {
  id: number;
}

function TableEstados({ id }: TableEstadosProps) {
  const [reporte, setReporte] = React.useState({});
  React.useEffect(() => {
    getOneReporte(id).then((reporte) => {
      setReporte(reporte);
    });
  }, [id, getOneReporte, setReporte]);

  return (
    <ScrollArea h="520px">
      <Table withTableBorder className="text-white">
        <Table.Tr>
          <Table.Th>Cuenta</Table.Th>
          <Table.Th>Monto</Table.Th>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold text-lg">Ingresos</Table.Td>
        </Table.Tr>
        {reporte && reporte.data?.ingresos?.cuentas.map((cuenta: any) => (
          <Table.Tr key={cuenta.idCuenta}>
            <Table.Td>{cuenta.nombre}</Table.Td>
            <Table.Td>${cuenta.saldoFinal}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr>
          <Table.Td className="font-bold">Total Ingresos</Table.Td>
          <Table.Td>${reporte?.data?.ingresos?.totalIngresos}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold text-lg">Gastos</Table.Td>
        </Table.Tr>
        {reporte && reporte.data?.gastos?.cuentas.map((cuenta: any) => (
          <Table.Tr key={cuenta.idCuenta}>
            <Table.Td>{cuenta.nombre}</Table.Td>
            <Table.Td>${cuenta.saldoFinal}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr>
          <Table.Td className="font-bold">Total Gastos</Table.Td>
          <Table.Td>${reporte?.data?.gastos?.totalGastos}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold text-lg">Costos</Table.Td>
        </Table.Tr>
        {reporte && reporte.data?.costos?.cuentas.map((cuenta: any) => (
          <Table.Tr key={cuenta.idCuenta}>
            <Table.Td>{cuenta.nombre}</Table.Td>
            <Table.Td>${cuenta.saldoFinal}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr>
          <Table.Td className="font-bold">Total Costos</Table.Td>
          <Table.Td>${reporte?.data?.costos?.totalCostos}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold text-lg">Utilidad Neta</Table.Td>
          <Table.Td>${reporte?.data?.utilidadNeta}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td className="font-bold text-lg">Utilidad Bruta</Table.Td>
          <Table.Td>${reporte?.data?.utilidadBruta}</Table.Td>
        </Table.Tr>
      </Table>
    </ScrollArea>
  );
}

export default TableEstados;
