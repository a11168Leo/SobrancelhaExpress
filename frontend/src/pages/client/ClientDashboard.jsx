
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'

function ClientDashboard() {
  const [appointments, setAppointments] = useState([])
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const load = async () => {
      const me = await api.get('/auth/me')
      const id = me.data.user?.id || ''
      setUserId(id)
      if (!id) return
      const res = await api.get(`/appointments/client/${id}`)
      setAppointments(res.data.appointments || [])
    }
    load().catch(() => {})
  }, [])

  const stats = useMemo(() => {
    const now = dayjs()
    const future = appointments.filter((item) => dayjs(item.startTime).isAfter(now))
    const completed = appointments.filter((item) => item.status === 'completed')
    const next = future.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0] || null
    return {
      total: appointments.length,
      upcoming: future.length,
      completed: completed.length,
      next,
    }
  }, [appointments])

  return (
    <section className="page">
      <div>
        <h1>Dashboard</h1>
        <p className="page-subtitle">Resumo dos seus atendimentos no salao.</p>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>Total de agendamentos</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.total}</div>
          <p>Historico completo</p>
        </article>
        <article className="card">
          <h3>Proximos agendamentos</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.upcoming}</div>
          <p>Itens futuros</p>
        </article>
        <article className="card">
          <h3>Finalizados</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.completed}</div>
          <p>Atendimentos concluidos</p>
        </article>
      </div>

      <div className="card">
        <h3>Proximo horario</h3>
        {stats.next ? (
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            <p style={{ margin: 0 }}>
              <strong>Data:</strong> {dayjs(stats.next.startTime).format('DD/MM/YYYY HH:mm')}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Servico:</strong> {stats.next.service?.name || 'Servico'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Profissional:</strong> {stats.next.professional?.name || 'Profissional'}
            </p>
          </div>
        ) : (
          <p style={{ margin: 0, color: 'var(--muted)' }}>Voce nao possui horarios futuros.</p>
        )}
      </div>

      {userId && (
        <p style={{ color: 'var(--muted)' }}>
          ID da conta: {userId}
        </p>
      )}
    </section>
  )
}

export default ClientDashboard




