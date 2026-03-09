import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'

const formatMoney = (value) => `EUR ${Number(value || 0).toFixed(2)}`

const inRangeInclusive = (value, start, end) => {
  const date = dayjs(value)
  return date.isSame(start) || date.isSame(end) || (date.isAfter(start) && date.isBefore(end))
}

const getPct = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

function ProfessionalDashboard() {
  const [appointments, setAppointments] = useState([])
  const [financials, setFinancials] = useState([])
  const [services, setServices] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const meRes = await api.get('/auth/me')
        const professionalId = meRes.data.user?.id || meRes.data.user?._id
        if (!professionalId) return

        const [appointmentsRes, financialRes, servicesRes, clientsRes] = await Promise.all([
          api.get(`/appointments/professional/${professionalId}`).catch(() => ({ data: { appointments: [] } })),
          api.get('/financial').catch(() => ({ data: { financials: [] } })),
          api.get(`/services?professionalId=${professionalId}`).catch(() => ({ data: { services: [] } })),
          api.get('/team/clients').catch(() => ({ data: { users: [] } })),
        ])

        if (!mounted) return

        setAppointments(appointmentsRes.data.appointments || [])
        setFinancials(financialRes.data.financials || [])
        setServices(servicesRes.data.services || [])
        setClients(clientsRes.data.users || [])
        setLoading(false)
      } catch {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()
    const interval = window.setInterval(load, 45000)
    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  const todayRange = useMemo(() => {
    return {
      start: dayjs().startOf('day'),
      end: dayjs().endOf('day'),
    }
  }, [])

  const yesterdayRange = useMemo(() => {
    return {
      start: dayjs().subtract(1, 'day').startOf('day'),
      end: dayjs().subtract(1, 'day').endOf('day'),
    }
  }, [])

  const todayAppointments = useMemo(() => {
    return appointments.filter((item) => inRangeInclusive(item.startTime, todayRange.start, todayRange.end))
  }, [appointments, todayRange])

  const yesterdayAppointments = useMemo(() => {
    return appointments.filter((item) => inRangeInclusive(item.startTime, yesterdayRange.start, yesterdayRange.end))
  }, [appointments, yesterdayRange])

  const todayRevenue = useMemo(() => {
    return financials
      .filter((item) => item.status !== 'cancelled')
      .filter((item) => inRangeInclusive(item.createdAt, todayRange.start, todayRange.end))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [financials, todayRange])

  const yesterdayRevenue = useMemo(() => {
    return financials
      .filter((item) => item.status !== 'cancelled')
      .filter((item) => inRangeInclusive(item.createdAt, yesterdayRange.start, yesterdayRange.end))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [financials, yesterdayRange])

  const todayUniqueClients = useMemo(() => {
    return new Set(
      todayAppointments
        .map((item) => item.client?._id || item.client?.id || item.client?.email)
        .filter(Boolean)
    ).size
  }, [todayAppointments])

  const yesterdayUniqueClients = useMemo(() => {
    return new Set(
      yesterdayAppointments
        .map((item) => item.client?._id || item.client?.id || item.client?.email)
        .filter(Boolean)
    ).size
  }, [yesterdayAppointments])

  const revenueTrendPct = useMemo(
    () => getPct(todayRevenue, yesterdayRevenue),
    [todayRevenue, yesterdayRevenue]
  )

  const clientsTrendPct = useMemo(
    () => getPct(todayUniqueClients, yesterdayUniqueClients),
    [todayUniqueClients, yesterdayUniqueClients]
  )

  const completedToday = useMemo(
    () => todayAppointments.filter((item) => item.status === 'completed').length,
    [todayAppointments]
  )

  const averageTicket = completedToday ? todayRevenue / completedToday : 0

  const upcomingAppointments = useMemo(() => {
    return appointments.filter((item) => {
      return item.status !== 'cancelled' && dayjs(item.startTime).isAfter(dayjs())
    })
  }, [appointments])

  const newClientsToday = useMemo(() => {
    return clients.filter((item) => inRangeInclusive(item.createdAt, todayRange.start, todayRange.end)).length
  }, [clients, todayRange])

  const habitualClients = useMemo(() => {
    const counter = new Map()
    for (const appointment of appointments) {
      const clientId = appointment.client?._id || appointment.client?.id
      if (!clientId) continue
      counter.set(clientId, (counter.get(clientId) || 0) + 1)
    }
    return Array.from(counter.values()).filter((count) => count >= 3).length
  }, [appointments])

  const chartPoints = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const day = dayjs().subtract(6 - index, 'day')
      const start = day.startOf('day')
      const end = day.endOf('day')

      const money = financials
        .filter((item) => item.status !== 'cancelled')
        .filter((item) => inRangeInclusive(item.createdAt, start, end))
        .reduce((sum, item) => sum + Number(item.amount || 0), 0)

      const clientsCount = new Set(
        appointments
          .filter((item) => inRangeInclusive(item.startTime, start, end))
          .map((item) => item.client?._id || item.client?.id || item.client?.email)
          .filter(Boolean)
      ).size

      return {
        label: day.format('DD/MM'),
        money,
        clients: clientsCount,
      }
    })
  }, [appointments, financials])

  const maxMoney = useMemo(
    () => Math.max(...chartPoints.map((item) => item.money), 1),
    [chartPoints]
  )

  const maxClients = useMemo(
    () => Math.max(...chartPoints.map((item) => item.clients), 1),
    [chartPoints]
  )

  return (
    <section className="page professional-dashboard">
      <div className="professional-dashboard-head">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Visao geral dos seus resultados em tempo real.</p>
        </div>
        <div className="professional-live-pill">Atualizacao automatica a cada 45s</div>
      </div>

      {loading && (
        <article className="professional-performance-card">
          <p style={{ margin: 0 }}>Carregando indicadores...</p>
        </article>
      )}

      {!loading && (
        <>
          <article className="professional-performance-card">
            <div className="professional-metric-row">
              <div className="professional-metric-box">
                <span>Total de servicos</span>
                <strong>{services.length}</strong>
                <small>Catalogo ativo da profissional</small>
              </div>
              <div className="professional-metric-box">
                <span>Rendimento de hoje</span>
                <strong>{formatMoney(todayRevenue)}</strong>
                <small className={revenueTrendPct >= 0 ? 'up' : 'down'}>
                  {revenueTrendPct >= 0 ? '+' : '-'}
                  {Math.abs(revenueTrendPct).toFixed(1)}% vs ontem
                </small>
              </div>
              <div className="professional-metric-box">
                <span>Clientes de hoje</span>
                <strong>{todayUniqueClients}</strong>
                <small className={clientsTrendPct >= 0 ? 'up' : 'down'}>
                  {clientsTrendPct >= 0 ? '+' : '-'}
                  {Math.abs(clientsTrendPct).toFixed(1)}% vs ontem
                </small>
              </div>
            </div>

            <div className="professional-chart">
              <div className="professional-chart-legend">
                <span><i className="professional-dot money" /> Dinheiro por dia</span>
                <span><i className="professional-dot clients" /> Clientes por dia</span>
              </div>

              <div className="professional-bars">
                {chartPoints.map((point) => (
                  <div key={point.label} className="professional-bar-col">
                    <div className="professional-bar-stack">
                      <div
                        className="professional-bar money"
                        style={{ height: `${Math.max(4, (point.money / maxMoney) * 100)}%` }}
                        title={`${point.label}: ${formatMoney(point.money)}`}
                      />
                      <div
                        className="professional-bar clients"
                        style={{ height: `${Math.max(4, (point.clients / maxClients) * 100)}%` }}
                        title={`${point.label}: ${point.clients} clientes`}
                      />
                    </div>
                    <span className="professional-bar-label">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <div className="professional-kpi-grid">
            <article className="professional-kpi-card">
              <span>Sobra agendamentos</span>
              <strong>{upcomingAppointments.length}</strong>
              <small>Atendimentos ainda pendentes na agenda</small>
            </article>

            <article className="professional-kpi-card">
              <span>Media</span>
              <strong>{formatMoney(averageTicket)}</strong>
              <small>Valor medio por atendimento concluido hoje</small>
            </article>

            <article className="professional-kpi-card">
              <span>Novos clientes</span>
              <strong>{newClientsToday}</strong>
              <small>Clientes cadastrados hoje na plataforma</small>
            </article>

            <article className="professional-kpi-card">
              <span>Clientes habituais</span>
              <strong>{habitualClients}</strong>
              <small>Clientes com 3 ou mais atendimentos</small>
            </article>
          </div>
        </>
      )}
    </section>
  )
}

export default ProfessionalDashboard
