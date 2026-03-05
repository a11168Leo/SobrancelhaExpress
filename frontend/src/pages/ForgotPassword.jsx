
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useState } from 'react'
import api from '../api/api.js'
import '../css/login.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage(res.data?.message || 'Se o email existir, enviaremos as instrucoes.')
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Erro ao enviar o email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-overlay" />
      <div className="login-shell">
        <div className="login-panel">
          <h2>Recuperar senha</h2>
          <p className="page-subtitle">Digite seu email para receber o link.</p>
          <form onSubmit={submit} className="login-form">
            <input
              className="search"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
            {message && <p className="login-error">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword



