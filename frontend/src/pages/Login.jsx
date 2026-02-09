import { useState } from 'react'
import '../css/login.css'
import { useNavigate } from 'react-router-dom'
import api from '../api/api.js'
import logo from '../assets/Logo2.svg'
import bgLeft from '../assets/interior/interior2.jpeg'
import bgRight from '../assets/interior/interior1.jpeg'
import { FiEye, FiEyeOff } from 'react-icons/fi'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (isRegister && password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    try {
      const res = isRegister
        ? await api.post('/auth/register', { name, email, password, phone })
        : await api.post('/auth/login', { email, password })

      const token = res.data.token
      const role = res.data.user?.role || 'cliente'
      const emailValue = res.data.user?.email || email

      const storage = remember ? localStorage : sessionStorage
      storage.setItem('token', token)
      storage.setItem('role', role)
      storage.setItem('email', emailValue)

      if (role === 'admin') navigate('/admin/dashboard')
      else if (role === 'profissional') navigate('/profissional/dashboard')
      else navigate('/login')
    } catch (err) {
      const serverMessage = err?.response?.data?.message
      if (serverMessage) {
        setError(serverMessage)
      } else {
        setError(isRegister ? 'Não foi possível cadastrar.' : 'Credenciais inválidas.')
      }
    }
  }

  return (
    <div className="login-page">
      {/* Camada de fundo da página (Imagem de fundo com overlay) */}
      <div className="page-background" style={{ backgroundImage: `url(${bgLeft})` }}>
        <div className="page-overlay" />
      </div>

      <div className={`login-shell ${isRegister ? 'active' : ''}`}>
        {/* LADO DOS FORMULÁRIOS (LOGIN E CADASTRO) */}
        <div className="form-container sign-up">
          <form onSubmit={handleSubmit}>
            <img src={logo} alt="Logo" className="mini-logo" />
            <h2>Criar conta</h2>
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Telefone"
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
                const formatted = digits.replace(
                  /(\d{3})(\d{3})(\d{0,3})/,
                  (m, a, b, c) => (c ? `${a} ${b} ${c}` : `${a} ${b}`)
                )
                setPhone(formatted)
              }}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="pass-input">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="pass-input">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {error && isRegister && <p className="error">{error}</p>}
            <button className="main-btn" type="submit">Cadastrar</button>
          </form>
        </div>

        <div className="form-container sign-in">
          <form onSubmit={handleSubmit}>
            <img src={logo} alt="Logo" className="mini-logo" />
            <h2>Entrar</h2>
            <p className="subtitle">Acesse o painel do salão.</p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="pass-input">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              /> Lembrar de mim
            </label>
            {error && !isRegister && <p className="error">{error}</p>}
            <button className="main-btn" type="submit">Entrar</button>
            <a className="forgot-link" href="/esqueceu-senha">Esqueceu a senha?</a>
          </form>
        </div>

        {/* PAINEL DE SLIDE (OVERLAY) */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left" style={{ backgroundImage: `url(${bgLeft})` }}>
              <div className="inner-overlay" />
              <div className="toggle-content">
                <h3>Bem-vinda de volta</h3>
                <p>Acesse sua conta e continue.</p>
                <button type="button" className="ghost-btn" onClick={() => setIsRegister(false)}>
                  Já tenho conta
                </button>
              </div>
            </div>
            <div className="toggle-panel toggle-right" style={{ backgroundImage: `url(${bgRight})` }}>
              <div className="inner-overlay" />
              <div className="toggle-content">
                <h3>É nova por aqui?</h3>
                <p>Crie sua conta e comece agora mesmo.</p>
                <button type="button" className="ghost-btn" onClick={() => setIsRegister(true)}>
                  Criar conta
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login
