
/*
====================
SECAO INTERNA PADRAO
====================
*/

import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api



