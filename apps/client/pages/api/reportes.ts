import axios from "./axios";

export const getAllReportes = async () => {
  const { data } = await axios.get("/reportes");
  return data;
};

export const generateBalanceGeneral = async (body: any) => {
  const { data } = await axios.post("/reportes/balance-general", body);
  return data;
};

export const generateEstadoResultados = async (body: any) => {
  const { data } = await axios.post("/reportes/estado-resultados", body);
  return data;
};

export const getOneReporte = async (id: number) => {
  const { data } = await axios.get(`/reportes/${id}`);
  console.log(data);
  return data;
};

export const exportReporte = async (id: number) => {
  try {
    const response = await axios.get(`/reportes/${id}/exportar`, {
      responseType: "blob",
    });
    // Crear un Blob del archivo recibido
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Crear URL temporal
    const url = window.URL.createObjectURL(blob);

    // Crear un vínculo para descargar
    const link = document.createElement("a");
    link.href = url;

    // Si el backend manda el nombre en headers, lo tomas así:
    const fileName =
      response.headers["content-disposition"]?.split("filename=")[1] ??
      "reporte.xlsx";

    link.setAttribute("download", fileName);
    document.body.appendChild(link);

    // Disparar descarga
    link.click();

    // Liberar recursos
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al exportar:", error);
  }
};
