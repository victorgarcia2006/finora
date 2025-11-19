// pages/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getProfile } from "./api/auth";
import Head from "next/head";
import {
  Card,
  Button,
  Modal,
  Input,
  NumberInput,
  Select,
  ScrollArea,
} from "@mantine/core";
import { getAllPolizas, createPoliza } from "./api/polizas";
import { getCuentas } from "./api/cuentas";
import { IconChevronRight, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { DateInput } from "@mantine/dates";
import { getAllReportes } from "./api/reportes";

const schema = yup.object({
  fecha: yup.date().required("Fecha es requerida"),
  concepto: yup.string().required("Concepto es requerido"),
  movimientos: yup
    .array()
    .of(
      yup.object({
        debe: yup.number().required("Debe es requerido"),
        haber: yup.number().required("Haber es requerido"),
        idCuenta: yup.number().required("Cuenta es requerida"),
      })
    )
    .min(1, "Debes agregar al menos 1 movimiento"),
});

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState({ empresa: "" });
  const [polizas, setPolizas] = useState([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportes, setReportes] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fecha: new Date(),
      concepto: "",
      movimientos: [
        {
          debe: 0,
          haber: 0,
          idCuenta: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "movimientos",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login"); // redirige si no hay token
    }
    getProfile().then((profile) => {
      setProfile(profile);
    });
    getAllPolizas().then((polizas) => {
      setPolizas(polizas);
    });
    getCuentas().then((cuentas) => {
      //Las cuentas serán usadas para el select de cuentas
      //así que hay agarrar Cuenta_idCuenta y nombre
      setCuentas(() => {
        const tiposUnicos = [
          ...new Set(cuentas.map((c: any) => c.tipo_cuenta)),
        ];

        // 2️⃣ Construimos el array agrupado
        return tiposUnicos.map((tipo) => ({
          group: tipo,
          items: cuentas
            .filter((c: any) => c.tipo_cuenta === tipo)
            .map((c: any) => ({
              value: c.idCuenta.toString(),
              label: c.nombre,
            })),
        }));
      });
    });
    getAllReportes().then((reportes) => {
      console.log(reportes)
      setReportes(reportes);
    });
  }, [router, getAllPolizas, getAllReportes/* , polizas, reportes */]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      console.log("data", data);
      const response = await createPoliza(data);
      console.log("response", response);
      if (response) {
        close();
      }
    } catch (error) {
      alert("Error al crear movimiento");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#121212] w-screen h-screen p-5 flex flex-col gap-5">
      <Head>
        <title>Finora</title>
      </Head>
      <h1 className="text-3xl font-bold text-white">
        Bienvenido {profile?.empresa || ""}
      </h1>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">
          <Card
            shadow="sm"
            padding="lg"
            radius="lg"
            bg="#2F363D"
            className="flex flex-col gap-5"
          >
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold text-white">
                Ultimos movimientos
              </h2>
              <Button
                variant="outline"
                color="#1F4E79"
                leftSection={<IconPlus />}
                onClick={open}
              >
                Agregar
              </Button>
            </div>
            <ScrollArea h="600px">
              <div className="flex flex-col gap-5">
                {polizas.length > 0 ? (
                  polizas.map((poliza) => (
                    <Card
                      key={poliza.idPoliza}
                      withBorder
                      padding="lg"
                      radius="lg"
                      bg="#2F363D"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                          <h2 className="text-xl font-bold text-white">
                            {poliza.concepto}
                          </h2>
                          <p className="text-[#AAB2BD] min-w-24">
                            {poliza.fecha}
                          </p>
                        </div>
                        <div className="min-w-24">
                          <Button
                            variant="outline"
                            color="#1F4E79"
                            leftSection={<IconChevronRight />}
                            onClick={() =>
                              router.push(`/poliza/${poliza.idPoliza}`)
                            }
                          >
                            Ver
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-white">No hay movimientos</p>
                )}
              </div>
            </ScrollArea>
          </Card>
          <Modal
            opened={opened}
            onClose={close}
            centered
            radius="lg"
            title="Agregar movimiento"
            styles={{
              header: {
                backgroundColor: "#2F363D",
              },
              title: {
                color: "white",
                fontWeight: "bold",
              },
              close: {
                color: "white",
              },
              content: {
                backgroundColor: "#2F363D",
              },
            }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <Controller
                name="fecha"
                control={control}
                render={({ field }) => (
                  <DateInput
                    type="text"
                    label="Fecha"
                    placeholder="Fecha"
                    style={{
                      color: "white",
                    }}
                    error={errors.fecha?.message}
                    {...field}
                  />
                )}
              />
              <Controller
                name="concepto"
                control={control}
                render={({ field }) => (
                  <Input.Wrapper
                    label="Concepto"
                    error={errors.concepto?.message}
                    style={{
                      color: "white",
                    }}
                  >
                    <Input
                      type="text"
                      placeholder="Concepto"
                      error={errors.concepto?.message}
                      {...field}
                    />
                  </Input.Wrapper>
                )}
              />
              <div className="flex flex-col gap-5">
                <h3 className="font-semibold text-white">Movimientos</h3>
                {fields.map((item, index) => (
                  <div key={item.id} className="flex flex-col gap-5">
                    <Controller
                      name={`movimientos.${index}.idCuenta`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Cuenta"
                          placeholder="Cuenta"
                          searchable
                          error={errors.movimientos?.[index]?.idCuenta?.message}
                          {...field}
                          data={cuentas}
                          value={field.value?.toString()}
                          onChange={(value) => field.onChange(value)}
                          style={{
                            color: "white",
                          }}
                        />
                      )}
                    />
                    <Controller
                      name={`movimientos.${index}.debe`}
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          label="Debe"
                          placeholder="0.00"
                          error={errors.movimientos?.[index]?.debe?.message}
                          {...field}
                          style={{
                            color: "white",
                          }}
                        />
                      )}
                    />
                    <Controller
                      name={`movimientos.${index}.haber`}
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          label="Haber"
                          placeholder="0.00"
                          error={errors.movimientos?.[index]?.haber?.message}
                          {...field}
                          style={{
                            color: "white",
                          }}
                        />
                      )}
                    />
                    <Button
                      color="red"
                      variant="outline"
                      onClick={() => remove(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
                <Button
                  mt="sm"
                  variant="light"
                  onClick={() => append({ idCuenta: 0, debe: 0, haber: 0 })}
                >
                  Agregar movimiento
                </Button>
              </div>

              <Button
                type="submit"
                bg="#1F4E79"
                radius="lg"
                className="rounded-2xl p-2"
                loading={loading}
              >
                Agregar
              </Button>
            </form>
          </Modal>
        </div>
        <div className="col-span-2">
          <Card
            shadow="sm"
            padding="lg"
            radius="lg"
            bg="#2F363D"
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  Estados financieros
                </h2>
                <Button
                  variant="outline"
                  color="#1F4E79"
                  leftSection={<IconPlus />}
                  onClick={() => router.push("/reportes/generate")}
                >
                  Generar
                </Button>
              </div>
              {reportes.length > 0 ? (
                reportes.map((reporte) => (
                  <Card
                    key={reporte.idReporte}
                    withBorder
                    padding="lg"
                    radius="lg"
                    bg="#2F363D"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-bold text-white">
                          {reporte.tipo} - {reporte.fechaInicio} -{" "}
                          {reporte.fechaFin}
                        </h2>
                      </div>
                      <Button
                        variant="outline"
                        color="#1F4E79"
                        leftSection={<IconChevronRight />}
                        onClick={() =>
                          router.push(`/reportes/${reporte.idReporte}`)
                        }
                      >
                        Ver
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-white">No hay movimientos</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
