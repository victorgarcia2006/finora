import axios from "./axios";

export const getAllReportes = async () => {
    const { data } = await axios.get('/reportes');
    return data;
}

export const generateBalanceGeneral = async (body: any) => {
    const { data } = await axios.post('/reportes/balance-general', body);
    return data;
}

export const generateEstadoResultados = async (body: any) => {
    const { data } = await axios.post('/reportes/estado-resultados', body);
    return data;
}
