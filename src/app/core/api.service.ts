import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';

const api: AxiosInstance = axios.create({
  baseURL: environment.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  // Ajuste se precisar enviar cookies/autenticação
  withCredentials: false
});

export default api;
