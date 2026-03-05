
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import api from '../../api/api.js'

function ProfessionalAgendamentos() {
  const [searchParams] = useSearchParams()
  const [appointments, setAppointments] = useState([])
  const [events, setEvents] = useState([])
  const [businessHours, setBusinessHours] = useState({
    startTime: '09:00',
    endTime: '19:00',
  })
  const [toast, setToast] = useState(null)
  const [selected, setSelected] = useState(null)
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    clientId: '',
    serviceId: '',
    startTime: '',
    notes: '',
  })
  const [professionalId, setProfessionalId] = useState('')

  useEffect(() => {
    const load = async () => {
      const me = await api.get('/auth/me')
      setProfessionalId(me.data.user.id)
      const [res, settingsRes, clientsRes, servicesRes] = await Promise.all([
        api.get(`/appointments/professional/${me.data.user.id}`),
        api.get('/settings/business-hours'),
        api.get('/team/clients'),
        api.get(`/services?professionalId=${me.data.user.id}`),
      ])
      setAppointments(res.data.appointments || [])
      setBusinessHours(settingsRes.data)
      setClients(clientsRes.data.users || [])
      setServices(servicesRes.data.services || [])
      setEvents(
        (res.data.appointments || []).map((item) => ({
          id: item._id,
          title: `${item.client?.name || 'Cliente'} - ${item.service?.name || 'ServiÃ§o'}`,
          start: item.startTime,
          end: item.endTime,
          extendedProps: {
            status: item.status,
            clientName: item.client?.name || 'Cliente',
            serviceName: item.service?.name || 'ServiÃ§o',
          },
        }))
      )
    }
    load().catch(() => {})
  }, [])

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setIsNewOpen(true)
    }
  }, [searchParams])

  const refresh = async () => {
    if (!professionalId) return
    const res = await api.get(`/appointments/professional/${professionalId}`)
    setAppointments(res.data.appointments || [])
    setEvents(
      (res.data.appointments || []).map((item) => ({
        id: item._id,
        title: `${item.client?.name || 'Cliente'} - ${item.service?.name || 'ServiÃ§o'}`,
        start: item.startTime,
        end: item.endTime,
        extendedProps: {
          status: item.status,
          clientName: item.client?.name || 'Cliente',
          serviceName: item.service?.name || 'ServiÃ§o',
        },
      }))
    )
  }

  const todayCount = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return appointments.filter(
      (item) => dayjs(item.startTime).format('YYYY-MM-DD') === today
    ).length
  }, [appointments])

  const monthCount = useMemo(() => {
    const month = dayjs().format('YYYY-MM')
    return appointments.filter(
      (item) => dayjs(item.startTime).format('YYYY-MM') === month
    ).length
  }, [appointments])

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const createAppointment = async () => {
    if (!newAppointment.clientId || !newAppointment.serviceId || !newAppointment.startTime) {
      showToast('Preencha cliente, serviÃ§o e horÃ¡rio.')
      return
    }
    try {
      await api.post('/appointments', {
        professionalId,
        clientId: newAppointment.clientId,
        serviceId: newAppointment.serviceId,
        startTime: newAppointment.startTime,
        notes: newAppointment.notes,
      })
      setIsNewOpen(false)
      setNewAppointment({ clientId: '', serviceId: '', startTime: '', notes: '' })
      showToast('Agendamento criado com sucesso.')
      refresh()
    } catch {
      showToast('NÃ£o foi possÃ­vel criar o agendamento.')
    }
  }

  return (
    <section className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Agendamentos</h1>
          <p className="page-subtitle">Sua agenda completa.</p>
        </div>
        <button className="btn btn-profissional-agendamentos" type="button" onClick={() => setIsNewOpen(true)}>
          Novo agendamento
        </button>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>Agendamentos hoje</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{todayCount}</div>
          <p>Total do dia</p>
        </article>
        <article className="card">
          <h3>Agendamentos no mÃªs</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{monthCount}</div>
          <p>Total do mÃªs</p>
        </article>
      </div>

      <div className="card">
        <h3>CalendÃ¡rio</h3>
        <div style={{ marginTop: '1rem' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            height="auto"
            events={events}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: businessHours.startTime,
              endTime: businessHours.endTime,
            }}
            slotMinTime={`${businessHours.startTime}:00`}
            slotMaxTime={`${businessHours.endTime}:00`}
            eventDidMount={(info) => {
              const status = info.event.extendedProps.status
              const el = info.el
              if (status === 'cancelled') {
                el.style.backgroundColor = '#b77b93'
                el.style.borderColor = '#b77b93'
              } else if (status === 'completed') {
                el.style.backgroundColor = '#5f9a8f'
                el.style.borderColor = '#5f9a8f'
              } else {
                el.style.backgroundColor = '#d988b3'
                el.style.borderColor = '#d988b3'
              }
              el.setAttribute(
                'title',
                `${info.event.extendedProps.clientName} - ${info.event.extendedProps.serviceName}`
              )
            }}
            eventClick={(info) => {
              setSelected({
                id: info.event.id,
                clientName: info.event.extendedProps.clientName,
                serviceName: info.event.extendedProps.serviceName,
                status: info.event.extendedProps.status,
              })
            }}
          />
        </div>
      </div>

      <div className="card">
        <h3>PrÃ³ximos atendimentos</h3>
        <table className="table">
          <thead>
            <tr>
              <th>HorÃ¡rio</th>
              <th>Cliente</th>
              <th>ServiÃ§o</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((item) => (
              <tr key={item._id}>
                <td>{dayjs(item.startTime).format('DD/MM HH:mm')}</td>
                <td>{item.client?.name || 'Cliente'}</td>
                <td>{item.service?.name || 'ServiÃ§o'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            right: '2rem',
            bottom: '2rem',
            background: '#ffffff',
            border: '1px solid var(--stroke)',
            boxShadow: 'var(--shadow)',
            padding: '0.8rem 1.2rem',
            borderRadius: '999px',
            zIndex: 30,
          }}
        >
          {toast}
        </div>
      )}

      {selected && (
        <div className="salon-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="salon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="salon-modal-header">
              <h3>Atendimento</h3>
              <button className="btn btn-profissional-agendamentos" type="button" onClick={() => setSelected(null)}>
                Fechar
              </button>
            </div>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <p><strong>Cliente:</strong> {selected.clientName}</p>
              <p><strong>ServiÃ§o:</strong> {selected.serviceName}</p>
              <p><strong>Status:</strong> {selected.status}</p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-profissional-agendamentos"
                  type="button"
                  onClick={async () => {
                    try {
                      await api.patch(`/appointments/${selected.id}/status`, { status: 'scheduled' })
                      showToast('Atendimento iniciado.')
                      setSelected(null)
                      refresh()
                    } catch {
                      showToast('NÃ£o foi possÃ­vel iniciar.')
                    }
                  }}
                >
                  Iniciar
                </button>
                <button
                  className="btn btn-profissional-agendamentos"
                  type="button"
                  onClick={async () => {
                    try {
                      await api.patch(`/appointments/${selected.id}/status`, { status: 'completed' })
                      showToast('Atendimento finalizado.')
                      setSelected(null)
                      refresh()
                    } catch {
                      showToast('NÃ£o foi possÃ­vel finalizar.')
                    }
                  }}
                >
                  Finalizar
                </button>
                <button
                  className="btn btn-profissional-agendamentos"
                  type="button"
                  onClick={async () => {
                    try {
                      await api.patch(`/appointments/${selected.id}/status`, { status: 'cancelled' })
                      showToast('Atendimento cancelado.')
                      setSelected(null)
                      refresh()
                    } catch {
                      showToast('NÃ£o foi possÃ­vel cancelar.')
                    }
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-profissional-agendamentos"
                  type="button"
                  onClick={() => {
                    showToast('Cliente notificado.')
                    setSelected(null)
                  }}
                >
                  Notificar cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNewOpen && (
        <div className="salon-modal-backdrop" onClick={() => setIsNewOpen(false)}>
          <div className="salon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="salon-modal-header">
              <h3>Novo agendamento</h3>
              <button className="btn btn-profissional-agendamentos" type="button" onClick={() => setIsNewOpen(false)}>
                Fechar
              </button>
            </div>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <select
                className="search"
                value={newAppointment.clientId}
                onChange={(e) =>
                  setNewAppointment((prev) => ({ ...prev, clientId: e.target.value }))
                }
              >
                <option value="">Selecione o cliente</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <select
                className="search"
                value={newAppointment.serviceId}
                onChange={(e) =>
                  setNewAppointment((prev) => ({ ...prev, serviceId: e.target.value }))
                }
              >
                <option value="">Selecione o serviÃ§o</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <input
                className="search"
                type="datetime-local"
                value={newAppointment.startTime}
                onChange={(e) =>
                  setNewAppointment((prev) => ({ ...prev, startTime: e.target.value }))
                }
              />
              <textarea
                className="search"
                rows={3}
                placeholder="ObservaÃ§Ãµes"
                value={newAppointment.notes}
                onChange={(e) =>
                  setNewAppointment((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn btn-profissional-agendamentos" type="button" onClick={createAppointment}>
                  Salvar
                </button>
                <button className="btn btn-profissional-agendamentos" type="button" onClick={() => setIsNewOpen(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProfessionalAgendamentos





