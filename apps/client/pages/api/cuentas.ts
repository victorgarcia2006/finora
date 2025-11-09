import axios from "./axios";

export const getCuentas = async () => {
    const { data } = await axios.get('/cuentas');
    return data;
}
