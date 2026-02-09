import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'

function ProfessionalClientes() {
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    const load = async () => {
      const me = await api.get('/auth/me')
      const res = await api.get(`/appointments/professional/${me.data.user.id}`)
      setAppointments(res.data.appointments || [])
    }
    load().catch(() => {})
  }, [])

  const clients = useMemo(() => {
    const map = new Map()
    for (const item of appointments) {
      const client = item.client
      if (!client?._id) continue
      const current = map.get(client._id)
      if (!current || new Date(item.startTime) > new Date(current.lastVisit)) {
        map.set(client._id, {
          id: client._id,
          name: client.name,
          email: client.email,
          phone: client.phone || '-',
          lastService: item.service?.name || '-',
          lastVisit: item.startTime,
          duration: item.service?.maxDurationMinutes || item.service?.durationMinutes || 0,
        })
      }
    }
    return Array.from(map.values())
  }, [appointments])

  return (
    <section className="page">
      <div>
        <h1>Clientes</h1>
        <p className="page-subtitle">Clientes atendidos por você.</p>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Telefone</th>
              <th>Último serviço</th>
              <th>Duração</th>
              <th>Última visita</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.phone || '-'}</td>
                <td>{item.lastService}</td>
                <td>{item.duration ? `${item.duration} min` : '-'}</td>
                <td>{item.lastVisit ? dayjs(item.lastVisit).format('DD/MM/YYYY') : '-'}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5}>Sem clientes no momento.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ProfessionalClientes
