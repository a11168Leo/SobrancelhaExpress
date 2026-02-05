import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/api.js'
import '../css/login.css'

function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    if (password !== confirm) {
      setMessage('As senhas não coincidem.')
      return
    }
    const token = params.get('token')
    await api.post('/auth/reset-password', { token, newPassword: password })
    setMessage('Senha alterada com sucesso.')
    setTimeout(() => navigate('/login'), 1200)
  }

  return (
    <div className="login-page">
      <div className="login-overlay" />
      <div className="login-shell">
        <div className="login-panel">
          <h2>Nova senha</h2>
          <p className="page-subtitle">Defina sua nova senha.</p>
          <form onSubmit={submit} className="login-form">
            <input
              className="search"
              placeholder="Nova senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              className="search"
              placeholder="Repita a senha"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button className="btn" type="submit">Salvar</button>
            {message && <p className="login-error">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
