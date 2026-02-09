import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import '../css/admin.css'
import { useEffect, useState } from 'react'
import {
  FiBell,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
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
import api, { API_BASE_URL } from '../api/api.js'
import logo from '../assets/Logo2.svg'

const menuPrincipal = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: FiGrid },
  { label: 'Agendamentos', to: '/admin/agendamentos', icon: FiCalendar },
  { label: 'Clientes', to: '/admin/clientes', icon: FiUsers },
  { label: 'Serviços', to: '/admin/servicos', icon: FiScissors },
]

const menuGestao = [
  { label: 'Financeiro', to: '/admin/financeiro', icon: FiDollarSign },
  { label: 'Relatório', to: '/admin/relatorio', icon: FiBarChart2 },
  { label: 'Gerir equipe', to: '/admin/equipe', icon: FiUsers },
]

const menuConta = [
  { label: 'Perfil', to: '/admin/perfil', icon: FiUser },
  { label: 'Notificações', to: '/admin/notificacoes', icon: FiBell },
  { label: 'Configurações', to: '/admin/configuracoes', icon: FiSettings },
]

function AdminLayout() {
  const [adminName, setAdminName] = useState('Admin')
  const [isHidden, setIsHidden] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed')
    return saved ? saved === 'true' : false
  })
  const [adminAvatar, setAdminAvatar] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/auth/me')
      setAdminName(res.data.user?.name || 'Admin')
      const avatar = res.data.user?.avatar || ''
      setAdminAvatar(avatar)
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

  useEffect(() => {
    let lastScroll = window.scrollY
    const onScroll = () => {
      const current = window.scrollY
      if (current > lastScroll && current > 40) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }
      lastScroll = current
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`app-shell${collapsed ? ' is-collapsed' : ''}`}>
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="brand">
          <div className="brand-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img
                src={logo}
                alt="Logo do salão"
                className="brand-logo"
              />
            </div>
            <button
              className="collapse-button"
              type="button"
              onClick={() =>
                setCollapsed((prev) => {
                  const next = !prev
                  localStorage.setItem('adminSidebarCollapsed', String(next))
                  return next
                })
              }
              aria-label="Recolher menu"
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>
          <div className="brand-subtitle">Painel administrativo</div>
        </div>
        {adminAvatar && (
          <div className="profile-mini">
            <img
              src={adminAvatar.startsWith('http') ? adminAvatar : `${API_BASE_URL}${adminAvatar}`}
              alt="Avatar"
            />
            <div>
              <div style={{ fontWeight: 600 }}>{adminName}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Admin</div>
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
          <h4>Gestao</h4>
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

        <div className="sidebar-section">
          <h4>Conta</h4>
          <nav className="sidebar-nav">
            {menuConta.map((item) => (
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
              navigate('/login')
            }}
          >
            <FiLogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <div className={`topbar${isHidden ? ' hidden' : ''}`}>
          <div>
            <h2>Olá, {adminName}</h2>
            <p>Resumo rápido do salão e atividades do dia.</p>
          </div>
          <div className="topbar-actions">
            <input className="search" placeholder="Pesquisar cliente, serviço, profissional" />
            <div className="notify">
              <button className="notify-button" type="button" aria-label="Notificações">
                <FiBell size={18} />
              </button>
              <div className="notify-panel">
                {notifications.length === 0 && (
                  <div className="notify-item">
                    <h5>Sem notificações</h5>
                    <p>Você está em dia.</p>
                  </div>
                )}
                {notifications.slice(0, 4).map((item) => (
                  <div className="notify-item" key={item._id}>
                    <h5>{item.title}</h5>
                    <p>{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn btn-icon"
              type="button"
              onClick={() => navigate('/admin/agendamentos?novo=1')}
            >
              <FiPlus size={18} />
              Novo agendamento
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
