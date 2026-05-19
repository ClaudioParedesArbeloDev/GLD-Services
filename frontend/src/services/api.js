import axios from "axios";
import CurrentURL from "../api/url";

const api = axios.create({
  baseURL: `${CurrentURL}/api`,
});

// Token almacenado a nivel de módulo
let accessToken = null;

// Llamar esto desde un componente con contexto Auth0
export const setAccessToken = (token) => {
  accessToken = token;
};

// Interceptor: adjunta el token en cada request si está disponible
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;