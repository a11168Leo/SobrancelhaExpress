import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import api from '../../api/api.js'

function ProfessionalAgendamentos() {
  const [appointments, setAppointments] = useState([])
  const [events, setEvents] = useState([])
  const [businessHours, setBusinessHours] = useState({
    startTime: '09:00',
    endTime: '19:00',
  })
  const [toast, setToast] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const load = async () => {
      const me = await api.get('/auth/me')
      const [res, settingsRes] = await Promise.all([
        api.get(`/appointments/professional/${me.data.user.id}`),
        api.get('/settings/business-hours'),
      ])
      setAppointments(res.data.appointments || [])
      setBusinessHours(settingsRes.data)
      setEvents(
        (res.data.appointments || []).map((item) => ({
          id: item._id,
          title: `${item.client?.name || 'Cliente'} - ${item.service?.name || 'Serviço'}`,
          start: item.startTime,
          end: item.endTime,
          extendedProps: {
            status: item.status,
            clientName: item.client?.name || 'Cliente',
            serviceName: item.service?.name || 'Serviço',
            clientId: item.client?._id || item.client,
          },
        }))
      )
    }
    load().catch(() => {})
  }, [])

  const refresh = async () => {
    const me = await api.get('/auth/me')
    const res = await api.get(`/appointments/professional/${me.data.user.id}`)
    setAppointments(res.data.appointments || [])
    setEvents(
      (res.data.appointments || []).map((item) => ({
        id: item._id,
        title: `${item.client?.name || 'Cliente'} - ${item.service?.name || 'Serviço'}`,
        start: item.startTime,
        end: item.endTime,
        extendedProps: {
          status: item.status,
          clientName: item.client?.name || 'Cliente',
          serviceName: item.service?.name || 'Serviço',
          clientId: item.client?._id || item.client,
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

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <section className="page">
      <div>
        <h1>Agendamentos</h1>
        <p className="page-subtitle">Sua agenda completa.</p>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>Agendamentos hoje</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{todayCount}</div>
          <p>Total do dia</p>
        </article>
      </div>

      <div className="card">
        <h3>Calendário</h3>
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
        <h3>Próximos atendimentos</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Horário</th>
              <th>Cliente</th>
              <th>Serviço</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((item) => (
              <tr key={item._id}>
                <td>{dayjs(item.startTime).format('DD/MM HH:mm')}</td>
                <td>{item.client?.name || 'Cliente'}</td>
                <td>{item.service?.name || 'Serviço'}</td>
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
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Atendimento</h3>
              <button className="btn" type="button" onClick={() => setSelected(null)}>
                Fechar
              </button>
            </div>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <p><strong>Cliente:</strong> {selected.clientName}</p>
              <p><strong>Serviço:</strong> {selected.serviceName}</p>
              <p><strong>Status:</strong> {selected.status}</p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  className="btn"
                  type="button"
                  onClick={async () => {
                    try {
                      await api.patch(`/appointments/${selected.id}/status`, { status: 'scheduled' })
                      showToast('Atendimento iniciado.')
                      setSelected(null)
                      refresh()
                    } catch {
                      showToast('Não foi possível iniciar.')
                    }
                  }}
                >
                  Iniciar
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={async () => {
                    try {
                      await api.patch(`/appointments/${selected.id}/status`, { status: 'completed' })
                      showToast('Atendimento finalizado.')
                      setSelected(null)
                      refresh()
                    } catch {
                      showToast('Não foi possível finalizar.')
                    }
                  }}
                >
                  Finalizar
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={async () => {
                    try {
                      await api.patch(`/appointments/${selected.id}/status`, { status: 'cancelled' })
                      showToast('Atendimento cancelado.')
                      setSelected(null)
                      refresh()
                    } catch {
                      showToast('Não foi possível cancelar.')
                    }
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn"
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
    </section>
  )
}

export default ProfessionalAgendamentos
