/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/RELATORIO.JSX */
/* ======================================== */

import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import '../../styles/pages/Profissional/Relatorio.css'
import { fetchJson } from '../../services/api'

// Paleta de cores consistente com o site
const PINK       = '#c95184'
const PINK_LIGHT = '#ffa3b0'
const GREEN      = '#67c690'
const GREEN_DARK = '#329f68'
const GREY       = '#8d7b83'
const PURPLE     = '#9b72cf'
const ORANGE     = '#f0a04b'

const STATUS_COLORS = {
  scheduled: PINK_LIGHT,
  completed: GREEN,
  cancelled: GREY,
}

const CHART_COLORS = [PINK, PURPLE, ORANGE, GREEN, '#5c7bd9', '#f0d060']

// Gera os últimos N meses como rótulos { key, label }
function buildMonthKeys(n) {
  const result = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '')
    result.push({ key, label })
  }
  return result
}

function monthKey(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Tooltip personalizado com visual do site
function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="relatorio-tooltip">
      {label && <p className="relatorio-tooltip-label">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color || PINK }}>
          {entry.name}: <strong>{prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString('pt-PT') : entry.value}{suffix}</strong>
        </p>
      ))}
    </div>
  )
}

// Tooltip de receita com símbolo €
function RevenueTooltip(props) {
  return <CustomTooltip {...props} prefix="€ " />
}

// Legenda personalizada para Pie
function PieLegend({ data }) {
  return (
    <div className="relatorio-pie-legend">
      {data.map((item) => (
        <div key={item.name} className="relatorio-pie-legend-item">
          <span className="relatorio-pie-dot" style={{ background: item.color }} />
          <span>{item.name}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  )
}

// Componente principal
function Relatorio() {
  const [appointments, setAppointments] = useState([])
  const [financials, setFinancials]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [months, setMonths]             = useState(6)

  useEffect(() => {
    async function load() {
      try {
        const [aptsRes, finRes] = await Promise.all([
          fetchJson('/appointments/calendar'),
          fetchJson('/financial'),
        ])
        const apts = Array.isArray(aptsRes) ? aptsRes : aptsRes?.appointments || []
        const fins = Array.isArray(finRes) ? finRes : finRes?.financials || []
        setAppointments(apts)
        setFinancials(fins)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // --- Filtro de período ---
  const cutoff = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - months)
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  }, [months])

  const filteredApts = useMemo(
    () => appointments.filter((a) => new Date(a.startTime) >= cutoff),
    [appointments, cutoff]
  )

  const filteredFins = useMemo(
    () => financials.filter((f) => new Date(f.createdAt) >= cutoff),
    [financials, cutoff]
  )

  // --- KPIs ---
  const totalReceita    = useMemo(() => filteredFins.reduce((s, f) => s + (f.amount || 0), 0), [filteredFins])
  const totalAgendados  = useMemo(() => filteredApts.length, [filteredApts])
  const totalConcluidos = useMemo(() => filteredApts.filter((a) => a.status === 'completed').length, [filteredApts])
  const taxaConclusao   = useMemo(() => totalAgendados ? Math.round((totalConcluidos / totalAgendados) * 100) : 0, [totalAgendados, totalConcluidos])

  // --- Agendamentos por mês ---
  const monthKeys = useMemo(() => buildMonthKeys(months), [months])

  const appointmentsByMonth = useMemo(() => {
    const map = {}
    filteredApts.forEach((a) => {
      const k = monthKey(a.startTime)
      map[k] = (map[k] || 0) + 1
    })
    return monthKeys.map(({ key, label }) => ({ mes: label, agendamentos: map[key] || 0 }))
  }, [filteredApts, monthKeys])

  // --- Receita por mês ---
  const revenueByMonth = useMemo(() => {
    const map = {}
    filteredFins.forEach((f) => {
      const k = monthKey(f.createdAt)
      map[k] = (map[k] || 0) + (f.amount || 0)
    })
    return monthKeys.map(({ key, label }) => ({ mes: label, receita: map[key] || 0 }))
  }, [filteredFins, monthKeys])

  // --- Distribuição por estado ---
  const statusData = useMemo(() => [
    { name: 'Agendados',  value: filteredApts.filter((a) => a.status === 'scheduled').length,  color: PINK_LIGHT },
    { name: 'Concluídos', value: filteredApts.filter((a) => a.status === 'completed').length,  color: GREEN      },
    { name: 'Cancelados', value: filteredApts.filter((a) => a.status === 'cancelled').length,  color: GREY       },
  ], [filteredApts])

  // --- Serviços mais procurados ---
  const serviceData = useMemo(() => {
    const map = {}
    filteredApts.forEach((a) => {
      const name = a.service?.name || a.service?.nome || 'Outro'
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([servico, total]) => ({ servico, total }))
  }, [filteredApts])

  // --- Agendamentos por profissional ---
  const professionalData = useMemo(() => {
    const map = {}
    filteredApts.forEach((a) => {
      const name = a.professional?.name || 'Sem profissional'
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([profissional, total], i) => ({ profissional, total, fill: CHART_COLORS[i % CHART_COLORS.length] }))
  }, [filteredApts])

  // --- Por unidade ---
  const unitData = useMemo(() => {
    const cascais = filteredApts.filter((a) => a.unit !== 'almada').length
    const almada  = filteredApts.filter((a) => a.unit === 'almada').length
    return [
      { name: 'Cascais', value: cascais, color: PINK   },
      { name: 'Almada',  value: almada,  color: PURPLE },
    ]
  }, [filteredApts])

  // --- Receita por profissional ---
  const revenueByProfessional = useMemo(() => {
    const map = {}
    filteredFins.forEach((f) => {
      const appt = appointments.find((a) => (a._id || a.id) === (f.appointment?._id || f.appointment?.id || f.appointment))
      const name = appt?.professional?.name || 'Sem dados'
      map[name] = (map[name] || 0) + (f.amount || 0)
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([profissional, receita]) => ({ profissional, receita }))
  }, [filteredFins, appointments])

  if (loading) {
    return (
      <section className="relatorio-page">
        <p className="relatorio-loading">A carregar relatório...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="relatorio-page">
        <p className="relatorio-error">Erro ao carregar relatório: {error}</p>
      </section>
    )
  }

  return (
    <section className="relatorio-page" aria-label="Relatório">

      {/* Cabeçalho */}
      <div className="relatorio-header">
        <div>
          <h1>Relatório</h1>
          <p>Visão geral do desempenho financeiro, agendamentos e crescimento da equipa.</p>
        </div>
        <div className="relatorio-period-tabs">
          {[
            { label: '3 meses', value: 3 },
            { label: '6 meses', value: 6 },
            { label: '1 ano',   value: 12 },
          ].map(({ label, value }) => (
            <button
              key={value}
              type="button"
              className={`relatorio-period-btn${months === value ? ' is-active' : ''}`}
              onClick={() => setMonths(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="relatorio-kpi-grid">
        <article className="relatorio-kpi-card">
          <span className="relatorio-kpi-label">Receita total</span>
          <strong className="relatorio-kpi-value">€ {totalReceita.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</strong>
          <p className="relatorio-kpi-sub">Lançamentos financeiros no período</p>
        </article>
        <article className="relatorio-kpi-card">
          <span className="relatorio-kpi-label">Agendamentos</span>
          <strong className="relatorio-kpi-value">{totalAgendados}</strong>
          <p className="relatorio-kpi-sub">Total de agendamentos no período</p>
        </article>
        <article className="relatorio-kpi-card">
          <span className="relatorio-kpi-label">Concluídos</span>
          <strong className="relatorio-kpi-value" style={{ color: GREEN_DARK }}>{totalConcluidos}</strong>
          <p className="relatorio-kpi-sub">Atendimentos realizados com sucesso</p>
        </article>
        <article className="relatorio-kpi-card">
          <span className="relatorio-kpi-label">Taxa de conclusão</span>
          <strong className="relatorio-kpi-value">{taxaConclusao}%</strong>
          <p className="relatorio-kpi-sub">Percentagem de agendamentos concluídos</p>
        </article>
      </div>

      {/* Linha 1 — Receita e Agendamentos por mês */}
      <div className="relatorio-row">
        <div className="relatorio-chart-card">
          <div className="relatorio-chart-header">
            <h2>Receita mensal</h2>
            <p>Evolução dos lançamentos financeiros mês a mês.</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={PINK} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={PINK} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `€${v}`} />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="receita" name="Receita" stroke={PINK} strokeWidth={2} fill="url(#gradReceita)" dot={{ r: 4, fill: PINK }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="relatorio-chart-card">
          <div className="relatorio-chart-header">
            <h2>Agendamentos por mês</h2>
            <p>Número de agendamentos registados mês a mês.</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={appointmentsByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="agendamentos" name="Agendamentos" fill={PINK_LIGHT} radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Linha 2 — Distribuição por estado e Serviços mais procurados */}
      <div className="relatorio-row">
        <div className="relatorio-chart-card relatorio-chart-card--sm">
          <div className="relatorio-chart-header">
            <h2>Distribuição por estado</h2>
            <p>Proporção de agendamentos por estado atual.</p>
          </div>
          <div className="relatorio-pie-wrap">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={statusData} />
          </div>
        </div>

        <div className="relatorio-chart-card">
          <div className="relatorio-chart-header">
            <h2>Serviços mais procurados</h2>
            <p>Ranking dos serviços com mais agendamentos no período.</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={serviceData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="servico" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Agendamentos" fill={PINK} radius={[0, 6, 6, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Linha 3 — Por profissional e Por unidade */}
      <div className="relatorio-row">
        <div className="relatorio-chart-card">
          <div className="relatorio-chart-header">
            <h2>Agendamentos por profissional</h2>
            <p>Desempenho de cada membro da equipa em número de atendimentos.</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={professionalData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
              <XAxis dataKey="profissional" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Agendamentos" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {professionalData.map((entry) => (
                  <Cell key={entry.profissional} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="relatorio-chart-card relatorio-chart-card--sm">
          <div className="relatorio-chart-header">
            <h2>Por unidade</h2>
            <p>Distribuição de agendamentos entre as unidades Cascais e Almada.</p>
          </div>
          <div className="relatorio-pie-wrap">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={unitData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {unitData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={unitData} />
          </div>
        </div>
      </div>

      {/* Linha 4 — Receita por profissional */}
      {revenueByProfessional.length > 0 && (
        <div className="relatorio-chart-card relatorio-chart-card--full">
          <div className="relatorio-chart-header">
            <h2>Receita por profissional</h2>
            <p>Total de receita gerada por cada profissional no período selecionado.</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByProfessional} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
              <XAxis dataKey="profissional" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => `€${v}`} />
              <Tooltip content={<RevenueTooltip />} />
              <Bar dataKey="receita" name="Receita" fill={GREEN} radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </section>
  )
}

export default Relatorio
