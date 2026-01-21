// src/services/api.js
import axios from "axios";
import { getToken } from "./authGuard";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // coloque a URL do seu backend
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
