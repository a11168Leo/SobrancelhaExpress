/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/LOGIN.JSX */
/* ======================================== */

import { useState, useEffect } from 'react'
import { fetchJson } from '../../services/api'
import '../../styles/pages/Login/Login.css'

const backgroundImages = [
  new URL('../../assets/interior/IMG-20251106-WA0017(2).jpg', import.meta.url).href,
  new URL('../../assets/interior/IMG-20251106-WA0019(2).jpg', import.meta.url).href,
  new URL('../../assets/interior/IMG-20251106-WA0021(2).jpg', import.meta.url).href,
  new URL('../../assets/interior/IMG-20251106-WA0023(2).jpg', import.meta.url).href,
  new URL('../../assets/interior/IMG-20251106-WA0025(2).jpg', import.meta.url).href,
  new URL('../../assets/interior/IMG-20251106-WA0027(2).jpg', import.meta.url).href,
  new URL('../../assets/interior/IMG-20251106-WA0029(2).jpg', import.meta.url).href,
  new URL('../../assets/interior/IMG-20251106-WA0031(2).jpg', import.meta.url).href,
  new URL('../../assets/interior/IMG-20251106-WA0033(2).jpg', import.meta.url).href,
]

function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % backgroundImages.length)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const resetFeedback = () => {
    setError('')
    setSuccessMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    resetFeedback()

    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha para continuar.')
      return
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Informe seu nome completo.')
        return
      }

      if (password !== confirmPassword) {
        setError('As senhas precisam ser iguais.')
        return
      }
    }

    setIsLoading(true)
    try {
      const payload = mode === 'login'
        ? { email, password }
        : { name, email, password, phone }

      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const response = await fetchJson(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (!response?.user || !response?.token) {
        throw new Error('Resposta de autenticação inválida.')
      }

      if (mode === 'register') {
        setSuccessMessage('Cadastro concluído com sucesso! Entrando...')
      }

      onLoginSuccess(response.user, response.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-background" aria-hidden="true">
        {backgroundImages.map((src, index) => (
          <div
            key={src}
            className={`login-slide ${index === currentIndex ? 'is-active' : ''}`}
            style={{ backgroundImage: `url("${src}")` }}
          />
        ))}
      </div>
      <div className="login-card login-card--auth">
        <div className="login-brand">
          <span className="login-title">Sobrancelha Express</span>
          <p className="login-subtitle">
            {mode === 'login'
              ? 'Entre para acessar seu painel e gerenciar agendamentos.'
              : 'Cadastre-se como cliente e agende com facilidade.'}
          </p>
        </div>

        <div className="login-tabs" role="tablist">
          <button
            type="button"
            className={`login-tab ${mode === 'login' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('login')
              resetFeedback()
            }}
            aria-selected={mode === 'login'}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`login-tab ${mode === 'register' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('register')
              resetFeedback()
            }}
            aria-selected={mode === 'register'}
          >
            Cadastrar
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="login-field">
                <label htmlFor="register-name">Nome completo</label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome completo"
                  autoComplete="name"
                />
              </div>
              <div className="login-field">
                <label htmlFor="register-phone">Telefone</label>
                <input
                  id="register-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                  autoComplete="tel"
                />
              </div>
            </>
          )}

          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@exemplo.com"
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {mode === 'register' && (
            <div className="login-field">
              <label htmlFor="register-confirm-password">Confirmar senha</label>
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita sua senha"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <p className="login-error">{error}</p>}
          {successMessage && <p className="login-success">{successMessage}</p>}

          <button className="login-button" type="submit" disabled={isLoading}>
            {isLoading
              ? mode === 'login'
                ? 'Entrando...'
                : 'Criando conta...'
              : mode === 'login'
              ? 'Entrar'
              : 'Criar conta'}
          </button>
        </form>

        <div className="login-help login-help--compact">
          {mode === 'login' ? (
            <>
              <span>Ainda nao tem conta?</span>
              <button type="button" className="login-link" onClick={() => setMode('register')}>
                Cadastre-se agora
              </button>
            </>
          ) : (
            <>
              <span>Ja possui cadastro?</span>
              <button type="button" className="login-link" onClick={() => setMode('login')}>
                Voltar ao login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
