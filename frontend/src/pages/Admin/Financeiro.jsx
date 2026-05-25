import { useEffect, useMemo, useState } from 'react'
import '../../styles/pages/Profissional/Financeiro.css'
import { fetchJson } from '../../services/api'

function formatEur(value) {
  return Number(value || 0).toLocaleString('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function prettyUnit(unit) {
  if (!unit) return '—'
  return unit.charAt(0).toUpperCase() + unit.slice(1)
}

export default function Financeiro({ user }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchJson('/appointments/calendar')
      .then(res => {
        const items = Array.isArray(res) ? res : res?.appointments || []
        setAppointments(items)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const completed = useMemo(
    () => appointments.filter(a => a.status === 'completed'),
    [appointments]
  )

  const now = useMemo(() => new Date(), [])

  const filtered = useMemo(() => {
    if (period === 'all') return completed
    const cutoff = new Date(now)
    if (period === 'week') cutoff.setDate(cutoff.getDate() - 7)
    else if (period === 'month') cutoff.setMonth(cutoff.getMonth() - 1)
    else if (period === 'year') cutoff.setFullYear(cutoff.getFullYear() - 1)
    return completed.filter(a => new Date(a.startTime) >= cutoff)
  }, [completed, period, now])

  const totalRevenue = useMemo(
    () => filtered.reduce((acc, a) => acc + Number(a.service?.price || 0), 0),
    [filtered]
  )

  const totalAll = useMemo(
    () => completed.reduce((acc, a) => acc + Number(a.service?.price || 0), 0),
    [completed]
  )

  const avgTicket = useMemo(
    () => (filtered.length > 0 ? totalRevenue / filtered.length : 0),
    [totalRevenue, filtered]
  )

  const scheduledRevenue = useMemo(
    () => appointments
      .filter(a => a.status === 'scheduled')
      .reduce((acc, a) => acc + Number(a.service?.price || 0), 0),
    [appointments]
  )

  const byUnit = useMemo(() => {
    const map = {}
    for (const a of filtered) {
      const unit = a.unit || 'outro'
      if (!map[unit]) map[unit] = { count: 0, revenue: 0 }
      map[unit].count++
      map[unit].revenue += Number(a.service?.price || 0)
    }
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue)
  }, [filtered])

  const byProfessional = useMemo(() => {
    const map = {}
    for (const a of filtered) {
      const name = a.professional?.name || 'Desconhecido'
      if (!map[name]) map[name] = { count: 0, revenue: 0 }
      map[name].count++
      map[name].revenue += Number(a.service?.price || 0)
    }
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue)
  }, [filtered])

  const recentTransactions = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 20),
    [filtered]
  )

  const periodLabel = { week: '7 dias', month: 'mês', year: 'ano', all: 'sempre' }

  if (loading) {
    return (
      <section className="fin-page">
        <div className="fin-loading">
          <div className="fin-spinner" />
          <p>A carregar dados financeiros…</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="fin-page">
        <div className="fin-error">
          <p>Erro ao carregar dados: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="fin-page" aria-label="Financeiro">
      {/* Header */}
      <div className="fin-header">
        <div>
          <h1>Financeiro</h1>
          <p>Resumo de receitas com base nos agendamentos concluídos.</p>
        </div>
        <div className="fin-period-tabs" role="tablist" aria-label="Período">
          {[['week', '7 dias'], ['month', 'Mês'], ['year', 'Ano'], ['all', 'Total']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={period === key}
              className={`fin-period-tab${period === key ? ' active' : ''}`}
              onClick={() => setPeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="fin-summary-grid">
        <article className="fin-card fin-card--accent">
          <span className="fin-card-label">Receita ({periodLabel[period]})</span>
          <strong className="fin-card-value">{formatEur(totalRevenue)}</strong>
          <p className="fin-card-sub">{filtered.length} serviços concluídos</p>
        </article>

        <article className="fin-card">
          <span className="fin-card-label">Ticket médio</span>
          <strong className="fin-card-value">{formatEur(avgTicket)}</strong>
          <p className="fin-card-sub">Por serviço concluído</p>
        </article>

        <article className="fin-card">
          <span className="fin-card-label">A receber</span>
          <strong className="fin-card-value fin-card-value--green">{formatEur(scheduledRevenue)}</strong>
          <p className="fin-card-sub">
            {appointments.filter(a => a.status === 'scheduled').length} agendamentos ativos
          </p>
        </article>

        <article className="fin-card">
          <span className="fin-card-label">Receita total</span>
          <strong className="fin-card-value">{formatEur(totalAll)}</strong>
          <p className="fin-card-sub">{completed.length} serviços (histórico completo)</p>
        </article>
      </div>

      <div className="fin-sections">
        {/* Breakdown por unidade + profissional */}
        <div className="fin-breakdown-col">
          {byUnit.length > 0 && (
            <div className="fin-breakdown-card">
              <h2>Por unidade</h2>
              <div className="fin-breakdown-list">
                {byUnit.map(([unit, data]) => {
                  const pct = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
                  return (
                    <div key={unit} className="fin-breakdown-row">
                      <div className="fin-breakdown-info">
                        <span className="fin-breakdown-name">{prettyUnit(unit)}</span>
                        <span className="fin-breakdown-count">{data.count} serviços</span>
                      </div>
                      <div className="fin-bar-wrap">
                        <div className="fin-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="fin-breakdown-value">{formatEur(data.revenue)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {byProfessional.length > 0 && (
            <div className="fin-breakdown-card">
              <h2>Por profissional</h2>
              <div className="fin-breakdown-list">
                {byProfessional.map(([name, data]) => {
                  const pct = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
                  return (
                    <div key={name} className="fin-breakdown-row">
                      <div className="fin-breakdown-info">
                        <span className="fin-breakdown-name">{name}</span>
                        <span className="fin-breakdown-count">{data.count} serviços</span>
                      </div>
                      <div className="fin-bar-wrap">
                        <div className="fin-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="fin-breakdown-value">{formatEur(data.revenue)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Transações recentes */}
        <div className="fin-transactions-card">
          <div className="fin-transactions-header">
            <h2>Transações recentes</h2>
            <span className="fin-transactions-badge">{filtered.length} registos</span>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="fin-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <p>Sem transações para o período selecionado.</p>
            </div>
          ) : (
            <div className="fin-tx-list">
              {recentTransactions.map(a => (
                <div key={a._id || a.id} className="fin-tx-row">
                  <div className="fin-tx-left">
                    <strong className="fin-tx-client">{a.client?.name || 'Cliente'}</strong>
                    <span className="fin-tx-service">{a.service?.name || 'Serviço'} · {prettyUnit(a.unit)}</span>
                    <span className="fin-tx-date">{formatDate(a.startTime)}</span>
                  </div>
                  <span className="fin-tx-amount">
                    {a.service?.price ? formatEur(a.service.price) : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
