import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Card, Button, Modal, Input, NumberInput, Select } from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DateInput } from "@mantine/dates";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { generateBalanceGeneral, generateEstadoResultados } from "../api/reportes";

const schema = yup.object({
  fechaInicio: yup.date().required("Fecha inicial es requerida"),
  fechaFin: yup.date().required("Fecha final es requerida"),
});

function GenerateReportPage() {
  const [loading, setLoading] = useState(false);
  const [tipoReporte, setTipoReporte] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fechaInicio: new Date(),
      fechaFin: new Date(),
    },
  });
  const router = useRouter();

  useEffect(() => {
    console.log("Errores", errors);
  }, [errors]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      console.log("data", data);
      if (tipoReporte === "balance_general") {
        const response = await generateBalanceGeneral(data);
        console.log("response", response);
        if (response) {
          router.push(`/reportes/${response.idReporte}`);
        }
      } else if (tipoReporte === "estado_resultados") {
        const response = await generateEstadoResultados(data);
        console.log("response", response);
        if (response) {
          router.push(`/reportes/${response.idReporte}`);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-[#121212] w-screen h-screen p-5 flex flex-col gap-5">
      <Head>
        <title>Generar estado</title>
      </Head>
      <h1 className="text-3xl font-bold text-white">
        Generar estado financiero
      </h1>
      <div className="flex flex-col justify-center items-center h-full">
        <Card
          shadow="sm"
          padding="lg"
          radius="lg"
          bg="#2F363D"
          className="flex flex-col gap-5 w-80"
        >
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-bold text-white">
              Generar estado financiero
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <Select
                label="Tipo de reporte"
                placeholder="Tipo de reporte"
                searchable
                data={[
                  { value: "balance_general", label: "Balance general" },
                  { value: "estado_resultados", label: "Estado de resultados" },
                ]}
                onChange={(value) => {
                  setTipoReporte(value || "");
                }}
                style={{
                  color: "white",
                }}
              />
              <Controller
                name="fechaInicio"
                control={control}
                render={({ field }) => (
                  <DateInput
                    label="Fecha inicial"
                    placeholder="Fecha inicial"
                    error={errors.fechaInicio?.message}
                    style={{
                      color: "white",
                    }}
                    {...field}
                  />
                )}
              />
              <Controller
                name="fechaFin"
                control={control}
                render={({ field }) => (
                  <DateInput
                    label="Fecha final"
                    placeholder="Fecha final"
                    error={errors.fechaFin?.message}
                    style={{
                      color: "white",
                    }}
                    {...field}
                  />
                )}
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  color="#1F4E79"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button
                  //variant="outline"
                  color="#1F4E79"
                  type="submit"
                  loading={loading}
                >
                  Generar
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default GenerateReportPage;
