/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/SERVICES/API.JS */
/* ======================================== */

// Bloco: API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api'

export function getApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

export async function fetchJson(path, options = {}) {
  const response = await fetch(getApiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch (error) {
    throw new Error(`Falha ao parsear JSON: ${error.message}`)
  }

  if (!response.ok) {
    const message = data?.message || `Erro HTTP ${response.status}`
    throw new Error(message)
  }

  return data
}

export async function fetchFormData(path, { method = 'POST', body, headers = {}, ...rest } = {}) {
  const response = await fetch(getApiUrl(path), {
    method,
    body,
    headers,
    ...rest,
  })

  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch (error) {
    throw new Error(`Falha ao parsear JSON: ${error.message}`)
  }

  if (!response.ok) {
    const message = data?.message || `Erro HTTP ${response.status}`
    throw new Error(message)
  }

  return data
}

export function getServiceUrl(path) {
  return `${API_BASE_URL.replace(/\/api$/i, '')}${path}`
}
