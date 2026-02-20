import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import '../css/professional.css'
import { useEffect, useState } from 'react'
import {
  FiBell,
  FiCalendar,
  FiDollarSign,
  FiGrid,
  FiLogOut,
  FiPlus,
  FiScissors,
  FiSettings,
  FiUser,
  FiUsers,
  FiBarChart2,
} from 'react-icons/fi'
import { Toast } from 'bootstrap'
import api, { API_BASE_URL } from '../api/api.js'
import logo from '../assets/Logo2.svg'

const menuPrincipal = [
  { label: 'Dashboard', to: '/profissional/dashboard', icon: FiGrid },
  { label: 'Agendamentos', to: '/profissional/agendamentos', icon: FiCalendar },
  { label: 'Clientes', to: '/profissional/clientes', icon: FiUsers },
  { label: 'Serviços', to: '/profissional/servicos', icon: FiScissors },
]

const menuGestao = [
  { label: 'Financeiro', to: '/profissional/financeiro', icon: FiDollarSign },
  { label: 'Relatório', to: '/profissional/relatorio', icon: FiBarChart2 },
]

const menuConta = [
  { label: 'Perfil', to: '/profissional/perfil', icon: FiUser },
  { label: 'Notificações', to: '/profissional/notificacoes', icon: FiBell },
  { label: 'Configurações', to: '/profissional/configuracoes', icon: FiSettings },
]

function ProfessionalLayout() {
  const [name, setName] = useState('Profissional')
  const [notifications, setNotifications] = useState([])
  const [avatar, setAvatar] = useState('')
  const [toastData, setToastData] = useState({
    title: 'Notificações',
    time: 'Agora',
    message: 'Sem notificações.',
  })
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/auth/me')
      setName(res.data.user?.name || 'Profissional')
      setAvatar(res.data.user?.avatar || '')
    }
    load().catch(() => {})
  }, [])

  useEffect(() => {
    const loadNotifications = async () => {
      const res = await api.get('/notifications/me')
      setNotifications(res.data.notifications || [])
    }
    loadNotifications().catch(() => {})
  }, [])

  const showNotificationToast = () => {
    const latest = notifications[0]
    if (latest) {
      setToastData({
        title: latest.title || 'Notificação',
        time: 'Agora',
        message: latest.message || '',
      })
    } else {
      setToastData({
        title: 'Notificações',
        time: 'Agora',
        message: 'Sem notificações.',
      })
    }
    const el = document.getElementById('notifyToast')
    if (el) {
      const toast = Toast.getOrCreateInstance(el)
      toast.show()
    }
  }

  return (
    <div className="app-shell salon-shell">
      <header className="salon-header">
        <nav className="navbar salon-navbar navbar-expand-lg">
          <div className="container-fluid">
            <button
              className="navbar-brand salon-brand"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#professionalOffcanvas"
              aria-controls="professionalOffcanvas"
            >
              <img src={logo} alt="Logo do salão" className="brand-logo" />
              <div className="salon-brand-text">
                <span className="salon-brand-title">Painel Profissional</span>
                <span className="salon-greeting">Olá, {name}</span>
              </div>
            </button>
            <form className="d-flex salon-search" role="search">
              <input
                className="form-control salon-input"
                type="search"
                placeholder="Pesquisar cliente ou serviço"
                aria-label="Search"
              />
              <button className="btn salon-btn-outline" type="submit">Buscar</button>
            </form>
            <div className="salon-actions">
              <button
                className="btn salon-btn-icon"
                type="button"
                onClick={showNotificationToast}
                aria-label="Notificações"
              >
                <FiBell size={18} />
              </button>
              <button
                className="btn salon-btn"
                type="button"
                onClick={() => navigate('/profissional/agendamentos?novo=1')}
              >
                <FiPlus size={18} />
                Novo agendamento
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div
        className="offcanvas offcanvas-start salon-offcanvas"
        data-bs-scroll="true"
        tabIndex="-1"
        id="professionalOffcanvas"
        aria-labelledby="professionalOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="professionalOffcanvasLabel">Menu Profissional</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          {avatar && (
            <div className="profile-mini">
              <img
                src={avatar.startsWith('http') ? avatar : `${API_BASE_URL}${avatar}`}
                alt="Avatar"
              />
              <div>
                <div style={{ fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Profissional</div>
              </div>
            </div>
          )}

          <div className="offcanvas-section">
            <h6>Menu Principal</h6>
            <nav className="offcanvas-nav">
              {menuPrincipal.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  className={`offcanvas-link${location.pathname === item.to ? ' active' : ''}`}
                  onClick={() => navigate(item.to)}
                  data-bs-dismiss="offcanvas"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="offcanvas-section">
            <h6>Gestão</h6>
            <nav className="offcanvas-nav">
              {menuGestao.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  className={`offcanvas-link${location.pathname === item.to ? ' active' : ''}`}
                  onClick={() => navigate(item.to)}
                  data-bs-dismiss="offcanvas"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="offcanvas-section">
            <h6>Conta</h6>
            <nav className="offcanvas-nav">
              {menuConta.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  className={`offcanvas-link${location.pathname === item.to ? ' active' : ''}`}
                  onClick={() => navigate(item.to)}
                  data-bs-dismiss="offcanvas"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="offcanvas-exit">
            <button
              className="btn salon-btn-outline w-100"
              type="button"
              onClick={() => {
                localStorage.removeItem('token')
                sessionStorage.removeItem('token')
                localStorage.removeItem('role')
                sessionStorage.removeItem('role')
                localStorage.removeItem('email')
                sessionStorage.removeItem('email')
                navigate('/login')
              }}
            >
              <FiLogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </div>

      <main className="main">
        <Outlet />
      </main>

      <div className="toast-container position-fixed top-0 end-0 p-3">
        <div className="toast salon-toast" role="alert" aria-live="assertive" aria-atomic="true" id="notifyToast">
          <div className="toast-header">
            <img src={logo} className="rounded me-2 toast-logo" alt="Logo" />
            <strong className="me-auto">{toastData.title}</strong>
            <small>{toastData.time}</small>
            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div className="toast-body">
            {toastData.message}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalLayout
