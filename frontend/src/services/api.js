/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/SERVICES/API.JS */
/* ======================================== */

// Bloco: API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api'

export function getApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getAuthToken() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem('sobrancelha-token')
}

export async function fetchJson(path, options = {}) {
  const authToken = getAuthToken()
  const response = await fetch(getApiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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
  const authToken = getAuthToken()
  const response = await fetch(getApiUrl(path), {
    method,
    body,
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
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
