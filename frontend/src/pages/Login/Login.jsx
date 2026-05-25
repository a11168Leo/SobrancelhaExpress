/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/LOGIN.JSX */
/* ======================================== */

import { useState, useEffect, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { fetchJson } from '../../services/api'
import logo from '../../assets/logo/logo.svg'
import '../../styles/pages/Login/Login.css'

/* Chave de teste Google reCAPTCHA — substitua pela chave real em produção:
   https://www.google.com/recaptcha/admin/create */
const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

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

/* Máscara de telefone Portugal: 9XX XXX XXX ou 2XX XXX XXX */
function formatPortuguesePhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const recaptchaRef = useRef(null)

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

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')

    setPassword('')
    setConfirmPassword('')
    setCaptchaToken(null)
    recaptchaRef.current?.reset()
    resetFeedback()
  }

  const handlePhoneChange = (e) => {
    setPhone(formatPortuguesePhone(e.target.value))
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
      if (!captchaToken) {
        setError('Por favor, confirme que não é um robô.')
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
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Painel esquerdo — slideshow + branding */}
      <div className="login-panel-left" aria-hidden="true">
        <div className="login-background">
          {backgroundImages.map((src, index) => (
            <div
              key={src}
              className={`login-slide ${index === currentIndex ? 'is-active' : ''}`}
              style={{ backgroundImage: `url("${src}")` }}
            />
          ))}
        </div>
        <div className="login-left-overlay" />
        <div className="login-left-top">
          <img src={logo} alt="Sobrancelha Express" className="login-left-logo" />
        </div>
        <div className="login-left-content">
          <h1 className="login-left-title">Beleza que<br />transforma.</h1>
          <p className="login-left-tagline">
            Agende, gerencie e surpreenda.<br />
            Tudo num só lugar.
          </p>
          <div className="login-left-dots">
            {backgroundImages.map((_, i) => (
              <span key={i} className={`login-left-dot ${i === currentIndex ? 'is-active' : ''}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="login-panel-right">
        {/* Header mobile — logo + tagline sobre a imagem */}
        <div className="login-mobile-hero">
          <img src={logo} alt="Sobrancelha Express" className="login-mobile-hero-logo" />
          <span className="login-mobile-hero-name">Sobrancelha Express</span>
          <p className="login-mobile-hero-tagline">Beleza que transforma.</p>
          <div className="login-mobile-hero-dots">
            {backgroundImages.map((_, i) => (
              <span key={i} className={`login-left-dot ${i === currentIndex ? 'is-active' : ''}`} />
            ))}
          </div>
        </div>

        <div className="login-card">

          <div className="login-brand">
            <h2 className="login-greeting">
              {mode === 'login' ? 'Bem-vindo(a) de volta!' : 'Crie sua conta'}
            </h2>
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
              onClick={() => { setMode('login'); resetForm() }}
              aria-selected={mode === 'login'}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`login-tab ${mode === 'register' ? 'is-active' : ''}`}
              onClick={() => { setMode('register'); resetForm() }}
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
                  <div className="login-input-wrap">
                    <svg className="login-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="register-phone">Telefone</label>
                  <div className="login-input-wrap login-input-wrap--phone">
                    <span className="login-phone-prefix">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                      +351
                    </span>
                    <input
                      id="register-phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="912 345 678"
                      autoComplete="tel"
                    />
                  </div>
                </div>

              </>
            )}

            <div className="login-field">
              <label htmlFor="login-email">Email</label>
              <div className="login-input-wrap">
                <svg className="login-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 7l10 7 10-7" />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Senha</label>
              <div className="login-input-wrap">
                <svg className="login-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="login-field">
                <label htmlFor="register-confirm-password">Confirmar senha</label>
                <div className="login-input-wrap">
                  <svg className="login-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" /><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    id="register-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita sua senha"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Lembre de mim — apenas no login */}
            {mode === 'login' && (
              <div className="login-remember">
                <label className="login-remember-label">
                  <input
                    type="checkbox"
                    className="login-remember-input"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="login-remember-box">
                    <svg viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1,5 4.5,9 11,1" />
                    </svg>
                  </span>
                  <span className="login-remember-text">Lembre de mim</span>
                </label>
              </div>
            )}

            {/* reCAPTCHA — apenas no cadastro */}
            {mode === 'register' && (
              <div className="login-recaptcha">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                  hl="pt-PT"
                />
              </div>
            )}

            {error && (
              <div className="login-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
            {successMessage && <p className="login-success">{successMessage}</p>}

            <button className="login-button" type="submit" disabled={isLoading}>
              {isLoading
                ? mode === 'login' ? 'Entrando...' : 'Criando conta...'
                : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="login-help">
            {mode === 'login' ? (
              <>
                <span>Ainda não tem conta?</span>
                <button type="button" className="login-link" onClick={() => { setMode('register'); resetForm() }}>
                  Cadastre-se agora
                </button>
              </>
            ) : (
              <>
                <span>Já possui cadastro?</span>
                <button type="button" className="login-link" onClick={() => { setMode('login'); resetForm() }}>
                  Voltar ao login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
