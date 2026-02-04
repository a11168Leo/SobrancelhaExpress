import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'

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
  const [agenda, setAgenda] = useState([])

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
      const agendaItems = appointments.slice(0, 5).map((item) => ({
        time: dayjs(item.startTime).format('HH:mm'),
        client: item.client?.name || 'Cliente',
        service: item.service?.name || 'Serviço',
        status: item.status || 'scheduled',
      }))

      setAgenda(agendaItems)
      setStats({
        appointments: appointments.length,
        revenue: reportRes.data.total || 0,
        clients: clientsRes.data.users?.length || 0,
        services: servicesRes.data.services?.length || 0,
      })
    }

    load().catch(() => {})
  }, [range])

  return (
    <section className="page">
      <div>
        <h1>Dashboard</h1>
        <p className="page-subtitle">Bem-vinda de volta, veja o resumo do seu dia.</p>
        <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            className="btn"
            onClick={() => setFilter('today')}
          >
            Hoje
          </button>
          <button
            type="button"
            className="btn"
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
          <p>Total no período</p>
        </article>
        <article className="card">
          <h3>Faturamento</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            EUR {Number(stats.revenue).toFixed(2)}
          </div>
          <p>Período selecionado</p>
        </article>
        <article className="card">
          <h3>Clientes</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.clients}</div>
          <p>Base total</p>
        </article>
        <article className="card">
          <h3>Serviços</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.services}</div>
          <p>Catálogo ativo</p>
        </article>
      </div>

      <div className="stats-grid">
        <div className="card">
          <h3>Agenda de hoje</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {agenda.slice(0, 3).map((item) => (
                <tr key={`${item.time}-${item.client}`}>
                  <td>{item.time}</td>
                  <td>{item.client}</td>
                  <td>{item.service}</td>
                  <td>
                    <span className="pill">{item.status}</span>
                  </td>
                </tr>
              ))}
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
              value={stats.goal || 1000}
              onChange={(e) =>
                setStats((prev) => ({ ...prev, goal: Number(e.target.value) }))
              }
            />
            <div style={{ fontWeight: 600 }}>
              Meta: EUR {(stats.goal || 1000).toFixed(2)}
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
                  width: `${Math.min(
                    100,
                    ((stats.revenue || 0) / (stats.goal || 1000)) * 100
                  )}%`,
                  height: '100%',
                  background: 'var(--accent)',
                }}
              />
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              {Math.min(
                100,
                ((stats.revenue || 0) / (stats.goal || 1000)) * 100
              ).toFixed(1)}
              % atingido
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
