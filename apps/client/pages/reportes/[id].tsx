import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Card, ScrollArea, Button } from "@mantine/core";
import { getOneReporte, exportReporte } from "../api/reportes";
import { getProfile } from "../api/auth";
import { useRouter } from "next/router";
import { Table, Loader } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import TableBalance from "../../components/TableBalance";
import TableEstados from "../../components/TableEstados";

function OneReportPage() {
  const router = useRouter();
  const { id: idString } = router.query;
  const otroID = Number(idString);
  const [reporte, setReporte] = useState({});
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!otroID) return;
    getOneReporte(otroID).then((reporte) => {
      setReporte(reporte);
    });
    getProfile().then((profile) => {
      setUser(profile);
    });
  }, [otroID, getOneReporte, ]);

  const handleExport = async () => {
    setLoading(true);
    await exportReporte(otroID);
    setLoading(false);
  };

  /* const rowsBalanceActivos = reporte.data.activo.cuentas.map((activo: any) => (
    <Table.Tr key={activo.idCuenta}>
      <Table.Td>{activo.nombre}</Table.Td>
      <Table.Td>{activo.debe}</Table.Td>
      <Table.Td>{activo.haber}</Table.Td>
    </Table.Tr>
  )); */

  return (
    <main className="bg-[#121212] w-screen h-screen p-5 flex flex-col gap-5">
      <Head>
        <title>Reporte {otroID}</title>
      </Head>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-white">
          Reporte {reporte.fechaInicio} al {reporte.fechaFin}
        </h1>
        <Button
          //variant="outline"
          color="#1F4E79"
          leftSection={<IconDownload />}
          onClick={handleExport}
        >
          {loading ? "Descargando..." : "Descargar"}
        </Button>
      </div>
      <div className="flex flex-col gap-5">
        <Card
          shadow="sm"
          padding="lg"
          radius="lg"
          bg="#2F363D"
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <h2 className="text-2xl font-bold text-white">{user.empresa}</h2>
            <p className="text-[#AAB2BD] min-w-24">
              {reporte.tipo === "BALANCE_GENERAL"
                ? "Balance General"
                : "Estado de Resultados"}
            </p>
            <p className="text-[#AAB2BD] min-w-24">Al {reporte.fechaFin}</p>
          </div>
          {reporte === null ? (
            <div className="flex flex-col items-center justify-center">
              <Loader />
            </div>
          ) : reporte.tipo === "BALANCE_GENERAL" ? (
            <TableBalance id={otroID} />
          ) : (
            <TableEstados id={otroID} />
          )}
        </Card>
      </div>
    </main>
  );
}

export default OneReportPage;
