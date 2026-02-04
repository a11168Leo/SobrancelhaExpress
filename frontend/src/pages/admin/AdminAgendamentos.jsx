import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useSearchParams } from 'react-router-dom'
import api from '../../api/api.js'

function AdminAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [events, setEvents] = useState([])
  const [appointmentsRaw, setAppointmentsRaw] = useState([])
  const [searchParams] = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profissionais, setProfissionais] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicos, setServicos] = useState([])
  const [businessConfig, setBusinessConfig] = useState({
    startTime: '09:00',
    endTime: '19:00',
  })
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({
    professionalId: '',
    clientId: '',
    serviceId: '',
    startTime: '',
  })
  const [error, setError] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState(null)

  useEffect(() => {
    const load = async () => {
      const [res, profRes, clientRes, serviceRes] = await Promise.all([
        api.get('/appointments/all'),
        api.get('/team/professionals'),
        api.get('/team/clients'),
        api.get('/services'),
      ])
      const appointments = res.data.appointments || []
      const data = appointments.map((item) => ({
        time: dayjs(item.startTime).format('DD/MM HH:mm'),
        client: item.client?.name || 'Cliente',
        prof: item.professional?.name || 'Profissional',
        service: item.service?.name || 'Serviço',
      }))
      const mappedEvents = appointments.map((item) => ({
        id: item._id,
        title: `${item.client?.name || 'Cliente'} - ${item.service?.name || 'Serviço'}`,
        start: item.startTime,
        end: item.endTime,
        extendedProps: {
          professionalId: item.professional?._id || item.professional,
          clientId: item.client?._id || item.client,
          serviceId: item.service?._id || item.service,
          status: item.status,
          clientName: item.client?.name || 'Cliente',
          serviceName: item.service?.name || 'Serviço',
        }
      }))
      setAgendamentos(data)
      setEvents(mappedEvents)
      setAppointmentsRaw(appointments)
      setProfissionais(profRes.data.users || [])
      setClientes(clientRes.data.users || [])
      setServicos(serviceRes.data.services || [])
    }

    load().catch(() => {})
  }, [])

  useEffect(() => {
    const loadSettings = async () => {
      const res = await api.get('/settings/business-hours')
      setBusinessConfig(res.data)
    }
    loadSettings().catch(() => {})
  }, [])

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setIsModalOpen(true)
    }
  }, [searchParams])

  const stats = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    const todayCount = events.filter(
      (event) => dayjs(event.start).format('YYYY-MM-DD') === today
    ).length
    const monthCount = events.filter(
      (event) => dayjs(event.start).format('YYYY-MM') === dayjs().format('YYYY-MM')
    ).length
    return { todayCount, monthCount }
  }, [events])

  const businessHours = useMemo(
    () => ({
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      startTime: businessConfig.startTime,
      endTime: businessConfig.endTime,
    }),
    [businessConfig]
  )

  const getServiceDuration = (serviceId) => {
    const service = servicos.find((item) => item._id === serviceId)
    if (!service) return 0
    return service.maxDurationMinutes || service.durationMinutes || 0
  }

  const hasConflict = (professionalId, startIso, durationMinutes, ignoreId = null) => {
    if (!professionalId || !startIso || !durationMinutes) return false
    const start = new Date(startIso)
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
    return appointmentsRaw.some((item) => {
      if (item._id === ignoreId) return false
      if ((item.professional?._id || item.professional) !== professionalId) return false
      if (item.status === 'cancelled') return false
      const existingStart = new Date(item.startTime)
      const existingEnd = new Date(item.endTime)
      return start < existingEnd && end > existingStart
    })
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <section className="page">
      <div>
        <h1>Agendamentos</h1>
        <p className="page-subtitle">Controle total das agendas e conflitos.</p>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>Agendamentos no dia</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.todayCount}</div>
          <p>Resumo de hoje</p>
        </article>
        <article className="card">
          <h3>Agendamentos no mês</h3>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.monthCount}</div>
          <p>Total do mês</p>
        </article>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Calendário</h3>
          <button className="btn" type="button" onClick={() => setIsModalOpen(true)}>
            Novo agendamento
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
          <input
            className="search"
            type="time"
            value={businessConfig.startTime}
            onChange={(e) =>
              setBusinessConfig((prev) => ({ ...prev, startTime: e.target.value }))
            }
          />
          <input
            className="search"
            type="time"
            value={businessConfig.endTime}
            onChange={(e) =>
              setBusinessConfig((prev) => ({ ...prev, endTime: e.target.value }))
            }
          />
          <button
            className="btn"
            type="button"
            onClick={async () => {
              try {
                if (!businessConfig.startTime || !businessConfig.endTime) {
                  showToast('Preencha os horários do expediente.')
                  return
                }
                if (businessConfig.startTime >= businessConfig.endTime) {
                  showToast('O horário inicial deve ser menor que o final.')
                  return
                }
                await api.put('/settings/business-hours', businessConfig)
                showToast('Expediente salvo.')
              } catch {
                showToast('Não foi possível salvar o expediente.')
              }
            }}
          >
            Salvar expediente
          </button>
        </div>
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
            businessHours={businessHours}
            slotMinTime={`${businessConfig.startTime}:00`}
            slotMaxTime={`${businessConfig.endTime}:00`}
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
            editable
            eventAllow={(dropInfo) => {
              const hour = dayjs(dropInfo.start).format('HH:mm')
              return (
                hour >= businessConfig.startTime &&
                hour < businessConfig.endTime
              )
            }}
            eventDrop={async (info) => {
              const ok = window.confirm('Deseja reagendar este atendimento?')
              if (!ok) {
                info.revert()
                return
              }
              try {
                await api.patch(`/appointments/${info.event.id}`, {
                  professionalId: info.event.extendedProps.professionalId,
                  clientId: info.event.extendedProps.clientId,
                  serviceId: info.event.extendedProps.serviceId,
                  startTime: info.event.start.toISOString(),
                })
                const res = await api.get('/appointments/all')
                const appointments = res.data.appointments || []
                const data = appointments.map((item) => ({
                  time: dayjs(item.startTime).format('DD/MM HH:mm'),
                  client: item.client?.name || 'Cliente',
                  prof: item.professional?.name || 'Profissional',
                  service: item.service?.name || 'Serviço',
                }))
                const mappedEvents = appointments.map((item) => ({
                  id: item._id,
                  title: `${item.client?.name || 'Cliente'} - ${item.service?.name || 'Serviço'}`,
                  start: item.startTime,
                  end: item.endTime,
                  extendedProps: {
                    professionalId: item.professional?._id || item.professional,
                    clientId: item.client?._id || item.client,
                    serviceId: item.service?._id || item.service,
                    status: item.status,
                    clientName: item.client?.name || 'Cliente',
                    serviceName: item.service?.name || 'Serviço',
                  }
                }))
                setAgendamentos(data)
                setEvents(mappedEvents)
                setAppointmentsRaw(appointments)
                showToast('Agendamento atualizado.')
              } catch {
                info.revert()
                showToast('Não foi possível reagendar.')
              }
            }}
            eventResize={async (info) => {
              const duration = getServiceDuration(info.event.extendedProps.serviceId)
              const newMinutes = dayjs(info.event.end).diff(dayjs(info.event.start), 'minute')
              if (duration && newMinutes > duration) {
                showToast('Duração maior que o serviço. Ajuste o tempo correto.')
                info.revert()
                return
              }
              const ok = window.confirm('Deseja alterar a duração deste atendimento?')
              if (!ok) {
                info.revert()
                return
              }
              try {
                await api.patch(`/appointments/${info.event.id}`, {
                  professionalId: info.event.extendedProps.professionalId,
                  clientId: info.event.extendedProps.clientId,
                  serviceId: info.event.extendedProps.serviceId,
                  startTime: info.event.start.toISOString(),
                })
                const res = await api.get('/appointments/all')
                const appointments = res.data.appointments || []
                const data = appointments.map((item) => ({
                  time: dayjs(item.startTime).format('DD/MM HH:mm'),
                  client: item.client?.name || 'Cliente',
                  prof: item.professional?.name || 'Profissional',
                  service: item.service?.name || 'Serviço',
                }))
                const mappedEvents = appointments.map((item) => ({
                  id: item._id,
                  title: `${item.client?.name || 'Cliente'} - ${item.service?.name || 'Serviço'}`,
                  start: item.startTime,
                  end: item.endTime,
                  extendedProps: {
                    professionalId: item.professional?._id || item.professional,
                    clientId: item.client?._id || item.client,
                    serviceId: item.service?._id || item.service,
                    status: item.status,
                    clientName: item.client?.name || 'Cliente',
                    serviceName: item.service?.name || 'Serviço',
                  }
                }))
                setAgendamentos(data)
                setEvents(mappedEvents)
                setAppointmentsRaw(appointments)
                showToast('Duração atualizada.')
              } catch {
                info.revert()
                showToast('Não foi possível atualizar.')
              }
            }}
            eventClick={(info) => {
              setEditForm({
                id: info.event.id,
                professionalId: info.event.extendedProps.professionalId || '',
                clientId: info.event.extendedProps.clientId || '',
                serviceId: info.event.extendedProps.serviceId || '',
                startTime: dayjs(info.event.start).format('YYYY-MM-DDTHH:mm'),
                status: info.event.extendedProps.status || 'scheduled',
              })
              setEditModalOpen(true)
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
              <th>Profissional</th>
              <th>Serviço</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.slice(0, 6).map((item) => (
              <tr key={`${item.time}-${item.client}`}>
                <td>{item.time}</td>
                <td>{item.client}</td>
                <td>{item.prof}</td>
                <td>{item.service}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Novo agendamento</h3>
              <button className="btn" type="button" onClick={() => setIsModalOpen(false)}>
                Fechar
              </button>
            </div>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <select
                className="search"
                value={form.professionalId}
                onChange={(e) => setForm((prev) => ({ ...prev, professionalId: e.target.value }))}
              >
                <option value="">Selecione a profissional</option>
                {profissionais.map((prof) => (
                  <option key={prof._id || prof.id} value={prof._id || prof.id}>
                    {prof.name}
                  </option>
                ))}
              </select>
              <select
                className="search"
                value={form.clientId}
                onChange={(e) => setForm((prev) => ({ ...prev, clientId: e.target.value }))}
              >
                <option value="">Selecione o cliente</option>
                {clientes.map((client) => (
                  <option key={client._id || client.id} value={client._id || client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <select
                className="search"
                value={form.serviceId}
                onChange={(e) => setForm((prev) => ({ ...prev, serviceId: e.target.value }))}
              >
                <option value="">Selecione o serviço</option>
                {servicos.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <input
                className="search"
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
              />
              {form.serviceId && (
                <p style={{ margin: 0, color: 'var(--muted)' }}>
                  Duração: {getServiceDuration(form.serviceId)} min
                </p>
              )}
              {error && <p style={{ color: '#b12a5b', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  className="btn"
                  type="button"
                  onClick={async () => {
                    setError('')
                    if (!form.professionalId || !form.clientId || !form.serviceId || !form.startTime) {
                      setError('Preencha todos os campos.')
                      return
                    }
                    const duration = getServiceDuration(form.serviceId)
                    if (!duration) {
                      setError('Serviço sem duração válida.')
                      return
                    }
                    if (
                      hasConflict(
                        form.professionalId,
                        new Date(form.startTime).toISOString(),
                        duration
                      )
                    ) {
                      setError('Horário em conflito.')
                      return
                    }
                    try {
                      await api.post('/appointments', {
                        professionalId: form.professionalId,
                        clientId: form.clientId,
                        serviceId: form.serviceId,
                        startTime: new Date(form.startTime).toISOString(),
                      })
                      setIsModalOpen(false)
                      setForm({ professionalId: '', clientId: '', serviceId: '', startTime: '' })
                      const res = await api.get('/appointments/all')
                      const appointments = res.data.appointments || []
                      const data = appointments.map((item) => ({
                        time: dayjs(item.startTime).format('DD/MM HH:mm'),
                        client: item.client?.name || 'Cliente',
                        prof: item.professional?.name || 'Profissional',
                        service: item.service?.name || 'Serviço',
                      }))
                      const mappedEvents = appointments.map((item) => ({
                        id: item._id,
                        title: `${item.client?.name || 'Cliente'} - ${item.service?.name || 'Serviço'}`,
                        start: item.startTime,
                        end: item.endTime,
                        extendedProps: {
                          professionalId: item.professional?._id || item.professional,
                          clientId: item.client?._id || item.client,
                          serviceId: item.service?._id || item.service,
                          status: item.status,
                          clientName: item.client?.name || 'Cliente',
                          serviceName: item.service?.name || 'Serviço',
                        }
                      }))
                      setAgendamentos(data)
                      setEvents(mappedEvents)
                      setAppointmentsRaw(appointments)
                      showToast('Agendamento criado.')
                    } catch {
                      setError('Não foi possível criar o agendamento.')
                    }
                  }}
                >
                  Salvar
                </button>
                <button className="btn" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && editForm && (
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar agendamento</h3>
              <button className="btn" type="button" onClick={() => setEditModalOpen(false)}>
                Fechar
              </button>
            </div>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <select
                className="search"
                value={editForm.professionalId}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, professionalId: e.target.value }))
                }
              >
                <option value="">Selecione a profissional</option>
                {profissionais.map((prof) => (
                  <option key={prof._id || prof.id} value={prof._id || prof.id}>
                    {prof.name}
                  </option>
                ))}
              </select>
              <select
                className="search"
                value={editForm.clientId}
                onChange={(e) => setEditForm((prev) => ({ ...prev, clientId: e.target.value }))}
              >
                <option value="">Selecione o cliente</option>
                {clientes.map((client) => (
                  <option key={client._id || client.id} value={client._id || client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <select
                className="search"
                value={editForm.serviceId}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, serviceId: e.target.value }))
                }
              >
                <option value="">Selecione o serviço</option>
                {servicos.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <input
                className="search"
                type="datetime-local"
                value={editForm.startTime}
                onChange={(e) => setEditForm((prev) => ({ ...prev, startTime: e.target.value }))}
              />
              {editForm.serviceId && (
                <p style={{ margin: 0, color: 'var(--muted)' }}>
                  Duração: {getServiceDuration(editForm.serviceId)} min
                </p>
              )}
              {error && <p style={{ color: '#b12a5b', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  className="btn"
                  type="button"
                  onClick={async () => {
                    setError('')
                    if (
                      !editForm.professionalId ||
                      !editForm.clientId ||
                      !editForm.serviceId ||
                      !editForm.startTime
                    ) {
                      setError('Preencha todos os campos.')
                      return
                    }
                    const duration = getServiceDuration(editForm.serviceId)
                    if (!duration) {
                      setError('Serviço sem duração válida.')
                      return
                    }
                    if (
                      hasConflict(
                        editForm.professionalId,
                        new Date(editForm.startTime).toISOString(),
                        duration,
                        editForm.id
                      )
                    ) {
                      setError('Horário em conflito.')
                      return
                    }
                    try {
                      await api.patch(`/appointments/${editForm.id}`, {
                        professionalId: editForm.professionalId,
                        clientId: editForm.clientId,
                        serviceId: editForm.serviceId,
                        startTime: new Date(editForm.startTime).toISOString(),
                      })
                      setEditModalOpen(false)
                      setEditForm(null)
                      const res = await api.get('/appointments/all')
                      const appointments = res.data.appointments || []
                      const data = appointments.map((item) => ({
                        time: dayjs(item.startTime).format('DD/MM HH:mm'),
                        client: item.client?.name || 'Cliente',
                        prof: item.professional?.name || 'Profissional',
                        service: item.service?.name || 'Serviço',
                      }))
                      const mappedEvents = appointments.map((item) => ({
                        id: item._id,
                        title: `${item.client?.name || 'Cliente'} - ${item.service?.name || 'Serviço'}`,
                        start: item.startTime,
                        end: item.endTime,
                        extendedProps: {
                          professionalId: item.professional?._id || item.professional,
                          clientId: item.client?._id || item.client,
                          serviceId: item.service?._id || item.service,
                          status: item.status,
                          clientName: item.client?.name || 'Cliente',
                          serviceName: item.service?.name || 'Serviço',
                        }
                      }))
                      setAgendamentos(data)
                      setEvents(mappedEvents)
                      setAppointmentsRaw(appointments)
                      showToast('Agendamento atualizado.')
                    } catch {
                      setError('Não foi possível atualizar o agendamento.')
                    }
                  }}
                >
                  Salvar alterações
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={async () => {
                    try {
                      await api.patch(`/appointments/${editForm.id}/status`, {
                        status: 'cancelled',
                      })
                      setEditModalOpen(false)
                      setEditForm(null)
                      const res = await api.get('/appointments/all')
                      const appointments = res.data.appointments || []
                      const data = appointments.map((item) => ({
                        time: dayjs(item.startTime).format('DD/MM HH:mm'),
                        client: item.client?.name || 'Cliente',
                        prof: item.professional?.name || 'Profissional',
                        service: item.service?.name || 'Serviço',
                      }))
                      const mappedEvents = appointments.map((item) => ({
                        id: item._id,
                        title: `${item.client?.name || 'Cliente'} - ${item.service?.name || 'Serviço'}`,
                        start: item.startTime,
                        end: item.endTime,
                        extendedProps: {
                          professionalId: item.professional?._id || item.professional,
                          clientId: item.client?._id || item.client,
                          serviceId: item.service?._id || item.service,
                          status: item.status,
                          clientName: item.client?.name || 'Cliente',
                          serviceName: item.service?.name || 'Serviço',
                        }
                      }))
                      setAgendamentos(data)
                      setEvents(mappedEvents)
                      setAppointmentsRaw(appointments)
                      showToast('Agendamento cancelado.')
                    } catch {
                      setError('Não foi possível cancelar o agendamento.')
                    }
                  }}
                >
                  Cancelar agendamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </section>
  )
}

export default AdminAgendamentos
