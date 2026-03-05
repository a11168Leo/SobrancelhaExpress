
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { Navigate } from 'react-router-dom'

const getStored = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key)

function RequireRole({ role, children }) {
  const token = getStored('token')
  const userRole = getStored('role')
  const userEmail = getStored('email')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (role && userRole !== role) {
    return <Navigate to="/login" replace />
  }

  if (role === 'profissional') {
    const allowedEmail = import.meta.env.VITE_PROFESSIONAL_EMAIL
    if (allowedEmail && userEmail !== allowedEmail) {
      return <Navigate to="/login" replace />
    }
  }

  return children
}

export default RequireRole



