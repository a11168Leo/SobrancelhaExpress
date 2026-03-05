
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api, { API_BASE_URL } from '../../api/api.js'

function ProfessionalDashboard() {
  const [appointments, setAppointments] = useState([])
  const [financials, setFinancials] = useState([])
  const [services, setServices] = useState([])
  const [todayClients, setTodayClients] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem('professionalGoal')
    return saved ? Number(saved) : 800
  })

  useEffect(() => {
    const load = async () => {
      const me = await api.get('/auth/me')
      const [appointmentsRes, financialRes, servicesRes] = await Promise.all([
        api.get(`/appointments/professional/${me.data.user.id}`),
        api.get('/financial'),
        api.get(`/services?professionalId=${me.data.user.id}`),
      ])
      const list = appointmentsRes.data.appointments || []
      setAppointments(list)
      setFinancials(financialRes.data.financials || [])
      setServices(servicesRes.data.services || [])

      const todayKey = dayjs().format('YYYY-MM-DD')
      const todayAppointments = list.filter(
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
    }
    load().catch(() => {})
  }, [statusFilter])

  const stats = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    const todayCount = appointments.filter(
      (item) => dayjs(item.startTime).format('YYYY-MM-DD') === today
    ).length
    const month = dayjs().format('YYYY-MM')
    const monthTotal = financials
      .filter((item) => dayjs(item.createdAt).format('YYYY-MM') === month)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    return { todayCount, monthTotal }
  }, [appointments, financials])

  return (
    <section className="page">
      <div>
        <h1>Dashboard</h1>
        <p className="page-subtitle">Resumo da sua agenda e faturamento.</p>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>Agendamentos hoje</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.todayCount}</div>
          <p>Seu total diÃ¡rio</p>
        </article>
        <article className="card">
          <h3>Faturamento do mÃªs</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            EUR {stats.monthTotal.toFixed(2)}
          </div>
          <p>Seu total no perÃ­odo</p>
        </article>
        <article className="card">
          <h3>ServiÃ§os ativos</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{services.length}</div>
          <p>CatÃ¡logo pessoal</p>
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
                localStorage.setItem('professionalGoal', String(value))
              }}
            />
            <div style={{ fontWeight: 600 }}>
              Meta: EUR {goal.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>
              Atual: EUR {Number(stats.monthTotal).toFixed(2)}
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
                  width: `${Math.min(100, ((stats.monthTotal || 0) / goal) * 100)}%`,
                  height: '100%',
                  background: 'var(--accent)',
                }}
              />
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              {Math.min(100, ((stats.monthTotal || 0) / goal) * 100).toFixed(1)}
              % atingido
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfessionalDashboard



