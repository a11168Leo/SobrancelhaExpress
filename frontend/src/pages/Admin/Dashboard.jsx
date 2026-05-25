 /* ======================================== */
 /* ARQUIVO: FRONTEND/SRC/PAGES/DASHBOARD.JSX */
 /* ======================================== */

import { useEffect, useMemo, useState } from 'react'
import '../../styles/pages/Profissional/Dashboard.css'
import { fetchJson } from '../../services/api'
import CalendarioEmbed from './CalendarioEmbed'

/**
 * Formata um horário no formato HH:MM para exibição
 * @param {string|Date} value - Data/hora a ser formatada
 * @returns {string} Horário formatado ou string vazia
 */
function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Traduz o estado do agendamento para português
 * @param {string} status - Estado do agendamento (scheduled, completed, cancelled)
 * @returns {string} Estado traduzido
 */
function formatStatusLabel(status) {
  if (status === 'completed') return 'Concluído'
  if (status === 'cancelled') return 'Cancelado'
  return 'Agendado'
}

/**
 * Componente de Dashboard com resumo de agendamentos e próximos horários
 * Exibe informações gerais do dia, lista de clientes e timeline de compromissos
 */
function Dashboard({ onNavigate }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetchJson('/appointments/calendar')
        const items = Array.isArray(response) ? response : response?.appointments || []
        setAppointments(items)
        setError(null)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const now = useMemo(() => new Date(), [])

  const startOfToday = useMemo(() => {
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    return today
  }, [now])

  const startOfTomorrow = useMemo(() => {
    const tomorrow = new Date(startOfToday)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }, [startOfToday])

  const startOfWeek = useMemo(() => {
    const weekStart = new Date(startOfToday)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    return weekStart
  }, [startOfToday])

  const endOfWeek = useMemo(() => {
    const weekEnd = new Date(startOfWeek)
    weekEnd.setDate(weekEnd.getDate() + 7)
    return weekEnd
  }, [startOfWeek])

  const statusSummary = useMemo(() => ({
    scheduled: appointments.filter((appointment) => appointment.status === 'scheduled').length,
    completed: appointments.filter((appointment) => appointment.status === 'completed').length,
    cancelled: appointments.filter((appointment) => appointment.status === 'cancelled').length,
  }), [appointments])

  const todayAppointments = useMemo(
    () => appointments
      .filter((appointment) => {
        const start = new Date(appointment.startTime)
        return start >= startOfToday && start < startOfTomorrow
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [appointments, startOfToday, startOfTomorrow]
  )

  const weekAppointments = useMemo(
    () => appointments
      .filter((appointment) => {
        const start = new Date(appointment.startTime)
        return start >= startOfWeek && start < endOfWeek
      }),
    [appointments, startOfWeek, endOfWeek]
  )

  const nextAppointments = useMemo(
    () => appointments
      .filter((appointment) => new Date(appointment.startTime) >= now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5),
    [appointments, now]
  )

  const prettyUnit = (unit) => (unit === 'almada' ? 'Almada' : 'Cascais')

  const openAgenda = () => {
    if (onNavigate) onNavigate('agenda')
  }

  if (loading) {
    return (
      <section className="dashboard-page">
        <p>A carregar dados do dashboard...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="dashboard-page">
        <p>Erro ao carregar o dashboard: {error}</p>
      </section>
    )
  }

  return (
    <section className="dashboard-page" aria-label="Dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumo rápido de agendamentos, clientes do dia e próximos horários da equipa.</p>
        </div>

        <div className="dashboard-actions">
          <button type="button" className="dashboard-primary-button" onClick={openAgenda}>
            Ver agenda
          </button>
          <button type="button" className="dashboard-secondary-button" onClick={openAgenda}>
            Novo agendamento
          </button>
        </div>
      </div>

      <div className="dashboard-summary-grid">
        <article className="dashboard-summary-card">
          <span>Total de agendamentos</span>
          <strong>{appointments.length}</strong>
          <p>Todos os agendamentos registados no sistema.</p>
        </article>

        <article className="dashboard-summary-card">
          <span>Hoje</span>
          <strong>{todayAppointments.length}</strong>
          <p>Agendamentos marcados para hoje.</p>
        </article>

        <article className="dashboard-summary-card">
          <span>Esta semana</span>
          <strong>{weekAppointments.length}</strong>
          <p>Agendamentos na semana atual.</p>
        </article>

        <article className="dashboard-summary-card">
          <span>Próximos</span>
          <strong>{nextAppointments.length}</strong>
          <p>Próximos horários agendados.</p>
        </article>
      </div>

      <section className="dashboard-calendar-section" aria-label="Calendário semanal">
        <div className="dashboard-calendar-header">
          <div>
            <h2>Semana da agenda</h2>
            <p>Visualize todos os agendamentos da semana numa visão clara de cada dia e horário.</p>
          </div>
        </div>
        <div className="dashboard-calendar-container">
          <CalendarioEmbed />
        </div>
      </section>

      <div className="dashboard-sections">
        <section className="dashboard-card dashboard-card-large" aria-label="Clientes agendados hoje">
          <div className="dashboard-card-header">
            <div>
              <h2>Clientes agendados hoje</h2>
              <p>Veja quem já tem horário marcado para hoje.</p>
            </div>
            <span className="dashboard-badge">{todayAppointments.length} clientes</span>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="dashboard-empty-state">
              <p>Não há agendamentos para hoje.</p>
            </div>
          ) : (
            <div className="dashboard-list">
              {todayAppointments.map((appointment) => (
                <article key={appointment._id || appointment.id} className="dashboard-list-item">
                  <div className="dashboard-list-time">{formatTime(appointment.startTime)}</div>
                  <div className="dashboard-list-content">
                    <strong>{appointment.client?.name || 'Cliente não informado'}</strong>
                    <p>{appointment.service?.name || 'Serviço não informado'} • {appointment.professional?.name || 'Profissional não informado'}</p>
                    {appointment.notes && (() => {
                      const match = appointment.notes.match(/Aviso do cliente:\s*(.+?)(\s*·|$)/i)
                      const msg = match?.[1]?.trim()
                      return msg ? (
                        <span className="dashboard-client-note">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          {msg}
                        </span>
                      ) : null
                    })()}
                  </div>
                  <span className={`dashboard-status dashboard-status-${appointment.status}`}>
                    {formatStatusLabel(appointment.status)}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Próximos agendamentos</h2>
              <p>Veja os horários futuros mais próximos da sua agenda.</p>
            </div>
          </div>

          {nextAppointments.length === 0 ? (
            <div className="dashboard-empty-state">
              <p>Não há próximos agendamentos disponíveis.</p>
            </div>
          ) : (
            <div className="dashboard-timeline-list">
              {nextAppointments.map((appointment) => (
                <div key={appointment._id || appointment.id} className="dashboard-timeline-item">
                  <div>
                    <span className="dashboard-timeline-time">{formatTime(appointment.startTime)}</span>
                    <strong>{appointment.client?.name || 'Cliente'}</strong>
                    <p>{appointment.service?.name || 'Serviço'} • {prettyUnit(appointment.unit)}</p>
                    {appointment.notes && (() => {
                      const match = appointment.notes.match(/Aviso do cliente:\s*(.+?)(\s*·|$)/i)
                      const msg = match?.[1]?.trim()
                      return msg ? (
                        <span className="dashboard-client-note">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          {msg}
                        </span>
                      ) : null
                    })()}
                  </div>
                  <span className={`dashboard-status dashboard-status-${appointment.status}`}>
                    {formatStatusLabel(appointment.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default Dashboard
