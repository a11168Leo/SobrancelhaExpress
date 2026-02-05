import { useState } from 'react'
import api from '../api/api.js'
import '../css/login.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    await api.post('/auth/forgot-password', { email })
    setMessage('Se o email existir, enviaremos as instruções.')
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
            <button className="btn" type="submit">Enviar</button>
            {message && <p className="login-error">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
