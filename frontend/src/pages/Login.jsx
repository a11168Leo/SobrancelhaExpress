import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api.js'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = isRegister
        ? await api.post('/auth/register', { name, email, password })
        : await api.post('/auth/login', { email, password })

      const token = res.data.token
      const role = res.data.user?.role || 'cliente'
      const emailValue = res.data.user?.email || email
      if (remember) {
        localStorage.setItem('token', token)
        localStorage.setItem('role', role)
        localStorage.setItem('email', emailValue)
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('role')
        sessionStorage.removeItem('email')
      } else {
        sessionStorage.setItem('token', token)
        sessionStorage.setItem('role', role)
        sessionStorage.setItem('email', emailValue)
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('email')
      }
      if (role === 'admin') {
        navigate('/admin/dashboard')
      } else if (role === 'profissional') {
        navigate('/profissional/dashboard')
      } else {
        navigate('/login')
      }
    } catch {
      setError(
        isRegister
          ? 'Não foi possível cadastrar. Verifique os dados.'
          : 'Credenciais inválidas. Verifique seu email e senha.'
      )
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="card" style={{ width: 'min(420px, 92vw)' }}>
        <h2 style={{ marginTop: 0 }}>{isRegister ? 'Criar conta' : 'Entrar'}</h2>
        <p className="page-subtitle">
          {isRegister ? 'Cadastre-se para acessar o painel.' : 'Acesse o painel administrativo.'}
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.8rem' }}>
          {isRegister && (
            <input
              className="search"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            className="search"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="search"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Lembrar de mim
          </label>
          {error && <p style={{ color: '#b12a5b', margin: 0 }}>{error}</p>}
          <button className="btn" type="submit">
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => setIsRegister((prev) => !prev)}
          >
            {isRegister ? 'Já tenho conta' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
