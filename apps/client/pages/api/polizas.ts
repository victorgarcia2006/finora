import axios from "./axios";

export const getAllPolizas = async () => {
    const { data } = await axios.get('/polizas');
    return data;
}

export const getPolizaById = async (id: string) => {
    const { data } = await axios.get(`/polizas/${id}`);
    return data;
}

export const createPoliza = async (poliza: any) => {
    const { data } = await axios.post('/polizas', poliza);
    return data;
}
