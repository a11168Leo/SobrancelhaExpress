import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../../api/api.js'

function AdminClientes() {
  const [clientes, setClientes] = useState([])
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    const load = async () => {
      const [clientsRes, appointmentsRes] = await Promise.all([
        api.get('/team/clients'),
        api.get('/appointments/all'),
      ])
      setClientes(clientsRes.data.users || [])
      setAppointments(appointmentsRes.data.appointments || [])
    }

    load().catch(() => {})
  }, [])

  const lastByClient = useMemo(() => {
    const map = new Map()
    for (const item of appointments) {
      const clientId = item.client?._id
      if (!clientId) continue
      const current = map.get(clientId)
      if (!current || new Date(item.startTime) > new Date(current.startTime)) {
        map.set(clientId, item)
      }
    }
    return map
  }, [appointments])

  return (
    <section className="page">
      <div>
        <h1>Clientes</h1>
        <p className="page-subtitle">Histórico e valor gerado por cliente.</p>
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
            {clientes.map((item) => {
              const last = lastByClient.get(item._id)
              const duration =
                last?.service?.maxDurationMinutes || last?.service?.durationMinutes || 0
              return (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.phone || '-'}</td>
                  <td>{last?.service?.name || '-'}</td>
                  <td>{duration ? `${duration} min` : '-'}</td>
                  <td>{last?.startTime ? dayjs(last.startTime).format('DD/MM/YYYY') : '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminClientes
