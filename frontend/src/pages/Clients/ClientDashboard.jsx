
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useState } from 'react'
import { fetchJson } from '../../services/api'

function ClientDashboard() {
  const [appointments, setAppointments] = useState([])
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const load = async () => {
      const me = await fetchJson('/auth/me')
      const id = me?.user?._id || me?.user?.id || ''
      setUserId(id)
      if (!id) return
      const res = await fetchJson(`/appointments/client/${id}`)
      setAppointments(res?.appointments || [])
    }
    load().catch(() => {})
  }, [])

  const stats = useMemo(() => {
    const now = Date.now()
    const future = appointments.filter((item) => new Date(item.startTime).getTime() > now)
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
              <strong>Data:</strong> {new Date(stats.next.startTime).toLocaleString('pt-PT')}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Servico:</strong> {stats.next.service?.name || 'Servico'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Profissional:</strong> {stats.next.professional?.name || 'Profissional'}
            </p>
          </div>
        ) : (
          <p style={{ margin: 0, color: 'var(--client-muted)' }}>Voce nao possui horarios futuros.</p>
        )}
      </div>

      {userId && (
        <p style={{ color: 'var(--client-muted)' }}>
          ID da conta: {userId}
        </p>
      )}
    </section>
  )
}

export default ClientDashboard




