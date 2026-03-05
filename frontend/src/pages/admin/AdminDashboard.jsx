
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api, { API_BASE_URL } from '../../api/api.js'

const getTodayRange = () => {
  const start = dayjs().startOf('day')
  const end = dayjs().endOf('day')
  return { start, end }
}

const getWeekRange = () => {
  const start = dayjs().startOf('week')
  const end = dayjs().endOf('week')
  return { start, end }
}

function AdminDashboard() {
  const [filter, setFilter] = useState('today')
  const [stats, setStats] = useState({
    appointments: 0,
    revenue: 0,
    clients: 0,
    services: 0,
  })
  const [todayClients, setTodayClients] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem('adminGoal')
    return saved ? Number(saved) : 1000
  })

  const range = useMemo(() => {
    return filter === 'today' ? getTodayRange() : getWeekRange()
  }, [filter])

  useEffect(() => {
    const load = async () => {
      const start = range.start.toISOString()
      const end = range.end.toISOString()

      const [appointmentsRes, clientsRes, servicesRes, reportRes] = await Promise.all([
        api.get('/appointments/all').catch(() => ({ data: { appointments: [] } })),
        api.get('/team/clients'),
        api.get('/services'),
        api.get(`/financial/report?start=${start}&end=${end}`),
      ])

      const appointments = appointmentsRes.data.appointments || []
      const todayKey = dayjs().format('YYYY-MM-DD')
      const todayAppointments = appointments.filter(
        (item) => dayjs(item.startTime).format('YYYY-MM-DD') === todayKey
      )
      const filteredToday = statusFilter === 'all'
        ? todayAppointments
        : todayAppointments.filter((item) => item.status === statusFilter)

      const agendaItems = filteredToday.slice(0, 6).map((item) => ({
        time: dayjs(item.startTime).format('HH:mm'),
        client: item.client?.name || 'Cliente',
        phone: item.client?.phone || '-',
        service: item.service?.name || 'ServiÃ§o',
        status: item.status || 'scheduled',
        avatar: item.client?.avatar || '',
      }))

      setTodayClients(agendaItems)
      setStats({
        appointments: appointments.length,
        revenue: reportRes.data.total || 0,
        clients: clientsRes.data.users?.length || 0,
        services: servicesRes.data.services?.length || 0,
      })
    }

    load().catch(() => {})
  }, [range, statusFilter])

  return (
    <section className="page">
      <div>
        <h1>Dashboard</h1>
        <p className="page-subtitle">Bem-vinda de volta, veja o resumo do seu dia.</p>
        <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            className="btn btn-admin-dashboard"
            onClick={() => setFilter('today')}
          >
            Hoje
          </button>
          <button
            type="button"
            className="btn btn-admin-dashboard"
            onClick={() => setFilter('week')}
          >
            Semana
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>Agendamentos</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.appointments}</div>
          <p>Total no perÃ­odo</p>
        </article>
        <article className="card">
          <h3>Faturamento</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            EUR {Number(stats.revenue).toFixed(2)}
          </div>
          <p>PerÃ­odo selecionado</p>
        </article>
        <article className="card">
          <h3>Clientes</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.clients}</div>
          <p>Base total</p>
        </article>
        <article className="card">
          <h3>ServiÃ§os</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.services}</div>
          <p>CatÃ¡logo ativo</p>
        </article>
      </div>

      <div className="stats-grid">
        <div className="card">
          <h3>Clientes agendados hoje</h3>
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <select
              className="search"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="scheduled">Agendado</option>
              <option value="completed">Finalizado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>HorÃ¡rio</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>ServiÃ§o</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayClients.map((item) => (
                <tr key={`${item.time}-${item.client}`}>
                  <td>{item.time}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {item.avatar ? (
                        <img
                          src={item.avatar.startsWith('http') ? item.avatar : `${API_BASE_URL}${item.avatar}`}
                          alt={item.client}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(217, 136, 179, 0.2)',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: 'var(--accent-strong)',
                          }}
                        >
                          {item.client?.[0] || 'C'}
                        </div>
                      )}
                      <span>{item.client}</span>
                    </div>
                  </td>
                  <td>{item.phone}</td>
                  <td>{item.service}</td>
                  <td>
                    <span className="pill">
                      {item.status === 'completed'
                        ? 'Finalizado'
                        : item.status === 'cancelled'
                          ? 'Cancelado'
                          : 'Agendado'}
                    </span>
                  </td>
                </tr>
              ))}
              {todayClients.length === 0 && (
                <tr>
                  <td colSpan={5}>Sem agendamentos para hoje.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Meta de faturamento</h3>
          <p className="page-subtitle">Ajuste sua meta e acompanhe o progresso.</p>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={goal}
              onChange={(e) => {
                const value = Number(e.target.value)
                setGoal(value)
                localStorage.setItem('adminGoal', String(value))
              }}
            />
            <div style={{ fontWeight: 600 }}>
              Meta: EUR {goal.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>
              Atual: EUR {Number(stats.revenue).toFixed(2)}
            </div>
            <div
              style={{
                height: '10px',
                borderRadius: '999px',
                background: 'var(--stroke)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, ((stats.revenue || 0) / goal) * 100)}%`,
                  height: '100%',
                  background: 'var(--accent)',
                }}
              />
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              {Math.min(100, ((stats.revenue || 0) / goal) * 100).toFixed(1)}
              % atingido
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard




