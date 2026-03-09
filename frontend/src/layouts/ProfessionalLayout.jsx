import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import '../css/professional.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import {
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiScissors,
  FiSearch,
  FiSettings,
  FiTrendingDown,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import api, { API_BASE_URL } from '../api/api.js'
import logo from '../assets/Logo2.svg'

const menuPrincipal = [
  { label: 'Dashboard', to: '/profissional/dashboard', icon: FiGrid },
  { label: 'Agendamentos', to: '/profissional/agendamentos', icon: FiCalendar },
  { label: 'Clientes', to: '/profissional/clientes', icon: FiUsers },
  { label: 'Servicos', to: '/profissional/servicos', icon: FiScissors },
]

const menuGestao = [
  { label: 'Financeiro', to: '/profissional/financeiro', icon: FiDollarSign },
  { label: 'Relatorio', to: '/profissional/relatorio', icon: FiBarChart2 },
]

const menuConta = [
  { label: 'Perfil', to: '/profissional/perfil', icon: FiUser },
  { label: 'Configuracoes', to: '/profissional/configuracoes', icon: FiSettings },
]

const sidebarMenu = [...menuPrincipal, ...menuGestao, ...menuConta]

const insightOptions = [
  { key: 'yesterday', label: 'Ontem' },
  { key: 'today', label: 'Hoje' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
]

const formatMoney = (value) => `EUR ${Number(value || 0).toFixed(2)}`

const getRangeByFilter = (filter) => {
  if (filter === 'yesterday') {
    return {
      label: 'Ontem',
      start: dayjs().subtract(1, 'day').startOf('day'),
      end: dayjs().subtract(1, 'day').endOf('day'),
    }
  }

  if (filter === 'week') {
    return {
      label: 'Semana',
      start: dayjs().startOf('week'),
      end: dayjs().endOf('week'),
    }
  }

  if (filter === 'month') {
    return {
      label: 'Mes',
      start: dayjs().startOf('month'),
      end: dayjs().endOf('month'),
    }
  }

  return {
    label: 'Hoje',
    start: dayjs().startOf('day'),
    end: dayjs().endOf('day'),
  }
}

function ProfessionalLayout() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('Profissional')
  const [avatar, setAvatar] = useState('')
  const [appointments, setAppointments] = useState([])
  const [financials, setFinancials] = useState([])
  const [clients, setClients] = useState([])
  const [notifications, setNotifications] = useState([])
  const [services, setServices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [insightFilter, setInsightFilter] = useState('today')

  const searchRef = useRef(null)
  const profileRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const meRes = await api.get('/auth/me')
        if (!mounted) return

        const me = meRes.data.user || {}
        const professionalId = me.id || me._id

        setUser(me)
        setName(me.name || 'Profissional')
        setAvatar(me.avatar || '')

        if (!professionalId) return

        const [
          appointmentsRes,
          financialRes,
          clientsRes,
          notificationsRes,
          servicesRes,
        ] = await Promise.all([
          api.get(`/appointments/professional/${professionalId}`).catch(() => ({ data: { appointments: [] } })),
          api.get('/financial').catch(() => ({ data: { financials: [] } })),
          api.get('/team/clients').catch(() => ({ data: { users: [] } })),
          api.get('/notifications/me').catch(() => ({ data: { notifications: [] } })),
          api.get(`/services?professionalId=${professionalId}`).catch(() => ({ data: { services: [] } })),
        ])

        if (!mounted) return

        setAppointments(appointmentsRes.data.appointments || [])
        setFinancials(financialRes.data.financials || [])
        setClients(clientsRes.data.users || [])
        setNotifications(notificationsRes.data.notifications || [])
        setServices(servicesRes.data.services || [])
      } catch {
        if (!mounted) return
      }
    }

    load()
    const interval = window.setInterval(load, 45000)
    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setProfileMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const futureAppointments = useMemo(() => {
    return appointments
      .filter((item) => {
        const isFuture = dayjs(item.startTime).isAfter(dayjs().subtract(1, 'minute'))
        return isFuture && item.status !== 'cancelled'
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  }, [appointments])

  const completedAppointments = useMemo(() => {
    return appointments.filter((item) => item.status === 'completed')
  }, [appointments])

  const nextAppointment = futureAppointments[0] || null

  const recentClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime()
        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 8)
  }, [clients])

  const searchAppointments = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    if (!term) return futureAppointments.slice(0, 6)

    return futureAppointments
      .filter((item) => {
        const clientName = item.client?.name || ''
        const serviceName = item.service?.name || ''
        return (
          clientName.toLowerCase().includes(term) ||
          serviceName.toLowerCase().includes(term)
        )
      })
      .slice(0, 6)
  }, [futureAppointments, searchQuery])

  const filteredRecentClients = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    if (!term) return recentClients
    return recentClients.filter((client) => {
      const fullName = client.name || ''
      const email = client.email || ''
      const phone = client.phone || ''
      return (
        fullName.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        phone.toLowerCase().includes(term)
      )
    })
  }, [recentClients, searchQuery])

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  const reviewHighlights = useMemo(() => {
    const fromNotifications = notifications
      .filter((item) => {
        const text = `${item.title || ''} ${item.message || ''}`.toLowerCase()
        return text.includes('avali')
      })
      .slice(0, 4)
      .map((item) => ({
        title: item.title || 'Avaliacao',
        message: item.message || '',
        when: item.createdAt || '',
      }))

    if (fromNotifications.length > 0) return fromNotifications

    return completedAppointments.slice(0, 4).map((item) => ({
      title: item.client?.name || 'Cliente',
      message: `Atendimento concluido de ${item.service?.name || 'servico'}.`,
      when: item.startTime || '',
    }))
  }, [notifications, completedAppointments])

  const profileScore = useMemo(() => {
    const base = 4.5
    const bonus = Math.min(0.5, completedAppointments.length / 120)
    return (base + bonus).toFixed(1)
  }, [completedAppointments.length])

  const insightRange = useMemo(() => getRangeByFilter(insightFilter), [insightFilter])
  const todayRange = useMemo(() => getRangeByFilter('today'), [])

  const summarizeRange = (start, end) => {
    const scopedAppointments = appointments.filter((item) => {
      const date = dayjs(item.startTime)
      return date.isSame(start) || date.isSame(end) || (date.isAfter(start) && date.isBefore(end))
    })

    const scopedFinancials = financials.filter((item) => {
      const date = dayjs(item.createdAt)
      return date.isSame(start) || date.isSame(end) || (date.isAfter(start) && date.isBefore(end))
    })

    const appointmentCount = scopedAppointments.length
    const completedCount = scopedAppointments.filter((item) => item.status === 'completed').length
    const uniqueClientCount = new Set(
      scopedAppointments
        .map((item) => item.client?._id || item.client?.id || item.client?.email)
        .filter(Boolean)
    ).size
    const revenue = scopedFinancials
      .filter((item) => item.status !== 'cancelled')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const averageTicket = completedCount ? revenue / completedCount : 0

    return {
      appointmentCount,
      completedCount,
      uniqueClientCount,
      revenue,
      averageTicket,
      servicesCount: services.length,
    }
  }

  const selectedSummary = useMemo(
    () => summarizeRange(insightRange.start, insightRange.end),
    [insightRange, appointments, financials, services]
  )

  const todaySummary = useMemo(
    () => summarizeRange(todayRange.start, todayRange.end),
    [todayRange, appointments, financials, services]
  )

  const previousSummary = useMemo(() => {
    const rangeMs = insightRange.end.diff(insightRange.start, 'millisecond') + 1
    const prevStart = insightRange.start.subtract(rangeMs, 'millisecond')
    const prevEnd = insightRange.end.subtract(rangeMs, 'millisecond')
    return summarizeRange(prevStart, prevEnd)
  }, [insightRange, appointments, financials, services])

  const moneyTrend = useMemo(() => {
    if (!previousSummary.revenue) return selectedSummary.revenue > 0 ? 100 : 0
    return ((selectedSummary.revenue - previousSummary.revenue) / Math.abs(previousSummary.revenue)) * 100
  }, [selectedSummary.revenue, previousSummary.revenue])

  const clientTrend = useMemo(() => {
    if (!previousSummary.uniqueClientCount) return selectedSummary.uniqueClientCount > 0 ? 100 : 0
    return (
      ((selectedSummary.uniqueClientCount - previousSummary.uniqueClientCount) /
        Math.abs(previousSummary.uniqueClientCount)) *
      100
    )
  }, [selectedSummary.uniqueClientCount, previousSummary.uniqueClientCount])

  const logout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    localStorage.removeItem('role')
    sessionStorage.removeItem('role')
    localStorage.removeItem('email')
    sessionStorage.removeItem('email')
    navigate('/login')
  }

  const isPathActive = (path) => location.pathname === path

  const renderAvatar = () => {
    if (avatar) {
      return (
        <img
          src={avatar.startsWith('http') ? avatar : `${API_BASE_URL}${avatar}`}
          alt={name}
          className="professional-avatar-image"
        />
      )
    }
    return <span>{name?.[0]?.toUpperCase() || 'P'}</span>
  }

  return (
    <div className="app-shell salon-shell professional-shell">
      <header className="salon-header professional-header">
        <nav className="navbar salon-navbar professional-navbar">
          <div className="container-fluid">
            <div className="professional-brand">
              <img src={logo} alt="Logo do salao" className="brand-logo" />
              <div className="salon-brand-text">
                <span className="salon-brand-title">Painel profissional</span>
                <span className="salon-greeting">Ola, {name}</span>
              </div>
            </div>

            <div className={`professional-search-shell${searchOpen ? ' is-open' : ''}`} ref={searchRef}>
              <button
                type="button"
                className="professional-search-icon"
                aria-label="Abrir busca"
                onClick={() => setSearchOpen((prev) => !prev)}
              >
                <FiSearch size={17} />
              </button>
              <input
                className="professional-search-input"
                type="search"
                placeholder="Buscar cliente, servico ou agendamento"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setSearchOpen(true)
                }}
              />

              {searchOpen && (
                <div className="professional-search-dropdown">
                  <div className="professional-search-column">
                    <h6>Proximo agendamento</h6>
                    {nextAppointment ? (
                      <button
                        type="button"
                        className="professional-next-appointment"
                        onClick={() => navigate('/profissional/agendamentos')}
                      >
                        <span>{dayjs(nextAppointment.startTime).format('DD/MM HH:mm')}</span>
                        <strong>{nextAppointment.client?.name || 'Cliente'}</strong>
                        <small>{nextAppointment.service?.name || 'Servico'}</small>
                      </button>
                    ) : (
                      <p className="professional-empty-inline">Sem agendamento futuro.</p>
                    )}

                    <h6>Agenda rapida</h6>
                    <div className="professional-dropdown-list">
                      {searchAppointments.map((item) => (
                        <button
                          key={`${item._id || item.id || item.startTime}-${item.client?._id || item.client?.email || item.client?.name}`}
                          type="button"
                          className="professional-dropdown-item"
                          onClick={() => navigate('/profissional/agendamentos')}
                        >
                          <FiClock size={14} />
                          <div>
                            <strong>{item.client?.name || 'Cliente'}</strong>
                            <small>
                              {dayjs(item.startTime).format('DD/MM HH:mm')} • {item.service?.name || 'Servico'}
                            </small>
                          </div>
                        </button>
                      ))}
                      {searchAppointments.length === 0 && (
                        <p className="professional-empty-inline">Sem resultados na agenda.</p>
                      )}
                    </div>
                  </div>

                  <div className="professional-search-column">
                    <h6>Clientes recentes</h6>
                    <div className="professional-dropdown-list">
                      {filteredRecentClients.map((client) => (
                        <button
                          key={client._id || client.id || client.email}
                          type="button"
                          className="professional-dropdown-item"
                          onClick={() => navigate('/profissional/clientes')}
                        >
                          <FiUsers size={14} />
                          <div>
                            <strong>{client.name || 'Cliente'}</strong>
                            <small>{client.phone || client.email || 'Sem contato'}</small>
                          </div>
                        </button>
                      ))}
                      {filteredRecentClients.length === 0 && (
                        <p className="professional-empty-inline">Sem clientes para exibir.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="professional-actions">
              <button
                className="professional-mobile-menu-btn"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#professionalMobileNav"
                aria-controls="professionalMobileNav"
                aria-label="Abrir menu"
              >
                <FiMenu size={18} />
              </button>

              <button
                className="btn salon-btn-icon professional-action-btn"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#professionalInsightsPanel"
                aria-controls="professionalInsightsPanel"
                aria-label="Abrir insights"
              >
                <FiBarChart2 size={18} />
              </button>

              <button
                className="btn salon-btn-icon professional-action-btn professional-notify-btn"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#professionalNotificationsPanel"
                aria-controls="professionalNotificationsPanel"
                aria-label="Abrir notificacoes"
              >
                <FiBell size={18} />
                {unreadNotifications > 0 && (
                  <span className="professional-notify-badge">{Math.min(9, unreadNotifications)}</span>
                )}
              </button>

              <div className="professional-profile-menu" ref={profileRef}>
                <button
                  className="professional-avatar-btn"
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="Abrir menu de perfil"
                >
                  {renderAvatar()}
                </button>

                {profileMenuOpen && (
                  <div className="professional-profile-dropdown">
                    <div className="professional-profile-summary">
                      <div className="professional-profile-avatar">{renderAvatar()}</div>
                      <div>
                        <strong>{name}</strong>
                        <small>{reviewHighlights.length || completedAppointments.length || 0} avaliacoes</small>
                        <small>{user?.salonName || 'Sobrancelhas Express'}</small>
                        <small>Nota media: {profileScore}</small>
                      </div>
                    </div>

                    <div className="professional-profile-actions">
                      <button type="button" onClick={() => navigate('/profissional/perfil')}>
                        Meu perfil
                      </button>
                      <button type="button" onClick={() => navigate('/profissional/configuracoes')}>
                        Configuracoes pessoais
                      </button>
                      <button type="button" onClick={() => navigate('/cliente/servicos#sobre')}>
                        Portfolio (pagina clientes)
                      </button>
                      <button type="button" className="logout" onClick={logout}>
                        <FiLogOut size={16} />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <div className="professional-body">
        <aside className="professional-icon-sidebar">
          {sidebarMenu.map((item) => (
            <button
              key={item.to}
              type="button"
              className={`professional-sidebar-icon${isPathActive(item.to) ? ' active' : ''}`}
              title={item.label}
              onClick={() => navigate(item.to)}
            >
              <item.icon size={19} />
            </button>
          ))}
        </aside>

        <main className="main professional-main">
          <Outlet />
        </main>
      </div>

      <div
        className="offcanvas offcanvas-start professional-mobile-offcanvas"
        tabIndex="-1"
        id="professionalMobileNav"
        aria-labelledby="professionalMobileNavLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="professionalMobileNavLabel">Menu profissional</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <div className="offcanvas-section">
            <h6>Menu principal</h6>
            <nav className="offcanvas-nav">
              {menuPrincipal.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  className={`offcanvas-link${isPathActive(item.to) ? ' active' : ''}`}
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
            <h6>Gestao</h6>
            <nav className="offcanvas-nav">
              {menuGestao.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  className={`offcanvas-link${isPathActive(item.to) ? ' active' : ''}`}
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
                  className={`offcanvas-link${isPathActive(item.to) ? ' active' : ''}`}
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
            <button className="btn salon-btn-outline w-100" type="button" onClick={logout}>
              <FiLogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div
        className="offcanvas offcanvas-end professional-sidepanel"
        tabIndex="-1"
        id="professionalNotificationsPanel"
        aria-labelledby="professionalNotificationsPanelLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="professionalNotificationsPanelLabel">Notificacoes</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <div className="professional-panel-section">
            <h6>Agendamentos</h6>
            <div className="professional-panel-list">
              {futureAppointments.slice(0, 7).map((item) => (
                <article
                  key={item._id || `${item.startTime}-${item.client?._id || item.client?.email || item.client?.name}`}
                  className="professional-panel-item"
                >
                  <strong>{item.client?.name || 'Cliente'}</strong>
                  <small>{item.service?.name || 'Servico'}</small>
                  <small>{dayjs(item.startTime).format('DD/MM/YYYY HH:mm')}</small>
                </article>
              ))}
              {futureAppointments.length === 0 && (
                <p className="professional-empty-inline">Nenhum agendamento futuro.</p>
              )}
            </div>
          </div>

          <div className="professional-panel-section">
            <h6>Avaliacoes dos clientes</h6>
            <div className="professional-panel-list">
              {reviewHighlights.map((item, index) => (
                <article key={`${item.title}-${index}`} className="professional-panel-item">
                  <strong>{item.title}</strong>
                  <small>{item.message}</small>
                  <small>{item.when ? dayjs(item.when).format('DD/MM/YYYY HH:mm') : 'Agora'}</small>
                </article>
              ))}
              {reviewHighlights.length === 0 && (
                <p className="professional-empty-inline">Ainda sem avaliacoes.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="offcanvas offcanvas-end professional-sidepanel"
        tabIndex="-1"
        id="professionalInsightsPanel"
        aria-labelledby="professionalInsightsPanelLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="professionalInsightsPanelLabel">Insights de desempenho</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <div className="professional-insight-filters">
            {insightOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`professional-insight-filter-btn${insightFilter === option.key ? ' active' : ''}`}
                onClick={() => setInsightFilter(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="professional-insight-highlight">
            <span>Resumo de hoje</span>
            <strong>{todaySummary.appointmentCount} agendamentos</strong>
            <small>{formatMoney(todaySummary.revenue)} em rendimento hoje</small>
          </div>

          <div className="professional-insight-grid">
            <article className="professional-insight-card">
              <span>Periodo</span>
              <strong>{insightRange.label}</strong>
              <small>{insightRange.start.format('DD/MM')} a {insightRange.end.format('DD/MM')}</small>
            </article>
            <article className="professional-insight-card">
              <span>Agendamentos</span>
              <strong>{selectedSummary.appointmentCount}</strong>
              <small>{selectedSummary.completedCount} concluidos</small>
            </article>
            <article className="professional-insight-card">
              <span>Clientes</span>
              <strong>{selectedSummary.uniqueClientCount}</strong>
              <small>Clientes unicos no periodo</small>
            </article>
            <article className="professional-insight-card">
              <span>Rendimento</span>
              <strong>{formatMoney(selectedSummary.revenue)}</strong>
              <small>Ticket medio: {formatMoney(selectedSummary.averageTicket)}</small>
            </article>
          </div>

          <div className="professional-insight-trends">
            <article className={`professional-insight-trend${moneyTrend >= 0 ? ' up' : ' down'}`}>
              <span>Dinheiro</span>
              <strong>
                {moneyTrend >= 0 ? <FiTrendingUp size={15} /> : <FiTrendingDown size={15} />}
                {Math.abs(moneyTrend).toFixed(1)}%
              </strong>
              <small>Comparado ao periodo anterior</small>
            </article>
            <article className={`professional-insight-trend${clientTrend >= 0 ? ' up' : ' down'}`}>
              <span>Clientes</span>
              <strong>
                {clientTrend >= 0 ? <FiTrendingUp size={15} /> : <FiTrendingDown size={15} />}
                {Math.abs(clientTrend).toFixed(1)}%
              </strong>
              <small>Comparado ao periodo anterior</small>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalLayout
