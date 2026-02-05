import { NavLink, Outlet } from 'react-router-dom'
import '../css/professional.css'
import { useEffect, useState } from 'react'
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiGrid,
  FiLogOut,
  FiScissors,
  FiUser,
} from 'react-icons/fi'
import api, { API_BASE_URL } from '../api/api.js'
import logo from '../assets/Logo2.svg'

const menuPrincipal = [
  { label: 'Dashboard', to: '/profissional/dashboard', icon: FiGrid },
  { label: 'Agendamentos', to: '/profissional/agendamentos', icon: FiCalendar },
  { label: 'Serviços', to: '/profissional/servicos', icon: FiScissors },
]

const menuGestao = [
  { label: 'Financeiro', to: '/profissional/financeiro', icon: FiDollarSign },
  { label: 'Perfil', to: '/profissional/perfil', icon: FiUser },
]

function ProfessionalLayout() {
  const [name, setName] = useState('Profissional')
  const [collapsed, setCollapsed] = useState(false)
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/auth/me')
      setName(res.data.user?.name || 'Profissional')
      setAvatar(res.data.user?.avatar || '')
    }
    load().catch(() => {})
  }, [])

  return (
    <div className="app-shell">
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="brand">
          <div className="brand-row">
            <img src={logo} alt="Logo do salão" className="brand-logo" />
            <button
              className="collapse-button"
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label="Recolher menu"
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>
          <div className="brand-subtitle">Painel profissional</div>
        </div>

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

        <div className="sidebar-section">
          <h4>Menu Principal</h4>
          <nav className="sidebar-nav">
            {menuPrincipal.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? ' active' : ''}`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-section">
          <h4>Conta</h4>
          <nav className="sidebar-nav">
            {menuGestao.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? ' active' : ''}`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-exit">
          <button
            className="sidebar-link"
            type="button"
            onClick={() => {
              localStorage.removeItem('token')
              sessionStorage.removeItem('token')
              localStorage.removeItem('role')
              sessionStorage.removeItem('role')
              localStorage.removeItem('email')
              sessionStorage.removeItem('email')
              window.location.href = '/login'
            }}
          >
            <FiLogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h2>Olá, {name}</h2>
            <p>Resumo das suas atividades de hoje.</p>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default ProfessionalLayout
