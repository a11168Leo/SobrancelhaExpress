
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'

const translateStatus = (status) => {
  if (status === 'completed') return 'Finalizado'
  if (status === 'cancelled') return 'Cancelado'
  return 'Agendado'
}

function ClientAgendamentos() {
  const [appointments, setAppointments] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const me = await api.get('/auth/me')
      const id = me.data.user?.id
      if (!id) return
      const res = await api.get(`/appointments/client/${id}`)
      setAppointments(res.data.appointments || [])
    }
    load().catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return appointments
      .filter((item) => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        if (!term) return true
        return (
          (item.service?.name || '').toLowerCase().includes(term) ||
          (item.professional?.name || '').toLowerCase().includes(term)
        )
      })
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  }, [appointments, statusFilter, search])

  return (
    <section className="page">
      <div>
        <h1>Meus agendamentos</h1>
        <p className="page-subtitle">Historico e status dos seus horarios.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input
            className="search"
            type="search"
            placeholder="Buscar por servico ou profissional"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="search"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Todos</option>
            <option value="scheduled">Agendados</option>
            <option value="completed">Finalizados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Servico</th>
              <th>Profissional</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item._id}>
                <td>{dayjs(item.startTime).format('DD/MM/YYYY HH:mm')}</td>
                <td>{item.service?.name || 'Servico'}</td>
                <td>{item.professional?.name || 'Profissional'}</td>
                <td>
                  <span className="pill">{translateStatus(item.status)}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4}>Nenhum agendamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ClientAgendamentos




