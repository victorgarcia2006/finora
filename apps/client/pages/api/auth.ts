import axios from "./axios";

export const login = async (email: string, password: string) => {
  const { data } = await axios.post('/auth/login', { email, password });

  // Guarda el token localmente
  localStorage.setItem('token', data.access_token);

  return data;
};

export const getProfile = async () => {
  const { data } = await axios.get('/auth/profile');
  return data;
}; 

export const register = async (userData: any) => {
  const { data } = await axios.post('/auth/register', userData);
  return data;
};