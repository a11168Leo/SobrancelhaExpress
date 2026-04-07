/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/CALENDARIO.JSX */
/* ======================================== */

// Importacoes
import { useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptLocale from '@fullcalendar/core/locales/pt'
import '../styles/pages/Calendario.css'
import { fetchJson } from '../services/api'

// Constante: APPOINTMENT_BUFFER_MINUTES
const APPOINTMENT_BUFFER_MINUTES = 10

// Constante: UNIT_OPTIONS
const UNIT_OPTIONS = [
  { value: 'cascais', label: 'Cascais' },
  { value: 'almada', label: 'Almada' },
]

// Funcao: formatStatusLabel
function formatStatusLabel(status) {
  if (status === 'completed') return 'Concluido'
  if (status === 'cancelled') return 'Cancelado'
  return 'Agendado'
}

// Funcao: formatUnitLabel
function formatUnitLabel(unit) {
  if (unit === 'almada') return 'Almada'
  return 'Cascais'
}

// Funcao: formatDateForInput
function formatDateForInput(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Funcao: formatTimeForInput
function formatTimeForInput(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

// Funcao: createEmptyScheduleForm
function createEmptyScheduleForm(clients, professionals, services) {
  return {
    appointmentId: '',
    clientId: clients[0]?._id || clients[0]?.id || '',
    clientSearch: clients[0]?.name || '',
    professionalId: professionals[0]?._id || professionals[0]?.id || '',
    serviceId: services[0]?._id || services[0]?.id || '',
    serviceSearch: services[0]?.name || services[0]?.nome || '',
    startDate: '',
    startTime: '',
    status: 'scheduled',
    unit: 'cascais',
  }
}

// Funcao: createScheduleFormFromAppointment
function createScheduleFormFromAppointment(appointment) {
  return {
    appointmentId: appointment._id || appointment.id,
    clientId: appointment?.client?._id || appointment?.client?.id || '',
    clientSearch: appointment?.client?.name || '',
    professionalId: appointment?.professional?._id || appointment?.professional?.id || '',
    serviceId: appointment?.service?._id || appointment?.service?.id || '',
    serviceSearch: appointment?.service?.name || appointment?.service?.nome || '',
    startDate: formatDateForInput(appointment.startTime),
    startTime: formatTimeForInput(appointment.startTime),
    status: appointment.status || 'scheduled',
    unit: appointment.unit || 'cascais',
  }
}

// Funcao: Calendario
function Calendario() {

// Estado do componente
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [services, setServices] = useState([])
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleModalMode, setScheduleModalMode] = useState('create')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [scheduleForm, setScheduleForm] = useState(createEmptyScheduleForm([], [], []))

// Efeito: carregamento inicial
  useEffect(() => {
    async function loadAppointments() {
      try {
        const [appointmentsResponse, professionalsResponse, clientsResponse, servicesResponse] = await Promise.all([
          fetchJson('/appointments/calendar'),
          fetchJson('/auth/professionals'),
          fetchJson('/auth/clients'),
          fetchJson('/services'),
        ])

        const appointmentItems = Array.isArray(appointmentsResponse) ? appointmentsResponse : appointmentsResponse?.appointments || []
        const professionalItems = Array.isArray(professionalsResponse) ? professionalsResponse : professionalsResponse?.users || []
        const clientItems = Array.isArray(clientsResponse) ? clientsResponse : clientsResponse?.users || []
        const serviceItems = Array.isArray(servicesResponse) ? servicesResponse : servicesResponse?.services || []

        setAppointments(appointmentItems)
        setProfessionals(professionalItems)
        setClients(clientItems)
        setServices(serviceItems)
        setError(null)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

// Renderizadores auxiliares
  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => (appointment._id || appointment.id) === selectedAppointmentId) || null,
    [appointments, selectedAppointmentId]
  )

  const filteredClients = useMemo(() => {
    const normalizedSearch = scheduleForm.clientSearch?.trim().toLowerCase() || ''
    if (!normalizedSearch) return clients
    return clients.filter((client) => (client.name || '').toLowerCase().includes(normalizedSearch))
  }, [clients, scheduleForm.clientSearch])

  const filteredServices = useMemo(() => {
    const normalizedSearch = scheduleForm.serviceSearch?.trim().toLowerCase() || ''
    if (!normalizedSearch) return services
    return services.filter((service) => ((service.name || service.nome || '').toLowerCase().includes(normalizedSearch)))
  }, [services, scheduleForm.serviceSearch])

  const calendarEvents = useMemo(() => appointments.map((appointment) => {
    const clientName = appointment?.client?.name || 'Cliente'
    const professionalName = appointment?.professional?.name || 'Profissional'
    const serviceName = appointment?.service?.name || 'Servico'
    const status = appointment?.status || 'scheduled'
    const appointmentId = appointment._id || appointment.id

    return {
      id: appointmentId,
      title: `${clientName} - ${serviceName}`,
      start: appointment.startTime,
      end: appointment.endTime,
      classNames: [`calendar-event-${status}`],
      extendedProps: {
        appointmentId,
        clientName,
        professionalName,
        serviceName,
        notes: appointment.notes || 'Sem observacoes adicionais.',
        status,
        unit: appointment.unit || 'cascais',
      },
    }
  }), [appointments])

  const statusSummary = useMemo(() => ({
    scheduled: appointments.filter((appointment) => appointment.status === 'scheduled').length,
    completed: appointments.filter((appointment) => appointment.status === 'completed').length,
    cancelled: appointments.filter((appointment) => appointment.status === 'cancelled').length,
  }), [appointments])

// Manipuladores de eventos
  const refreshAppointments = async () => {
    const response = await fetchJson('/appointments/calendar')
    const items = Array.isArray(response) ? response : response?.appointments || []
    setAppointments(items)
  }

  const updateScheduleField = (event) => {
    const { name, value } = event.target
    setScheduleForm((current) => ({ ...current, [name]: value }))
  }

  const selectClient = (client) => {
    setScheduleForm((current) => ({
      ...current,
      clientId: client._id || client.id,
      clientSearch: client.name || '',
    }))
  }

  const selectService = (service) => {
    setScheduleForm((current) => ({
      ...current,
      serviceId: service._id || service.id,
      serviceSearch: service.name || service.nome || '',
    }))
  }

  const openCreateScheduleModal = () => {
    setScheduleModalMode('create')
    setScheduleForm(createEmptyScheduleForm(clients, professionals, services))
    setSubmitError(null)
    setShowScheduleModal(true)
  }

  const openEditScheduleModal = (appointment) => {
    setSelectedAppointmentId(appointment._id || appointment.id)
    setScheduleModalMode('edit')
    setScheduleForm(createScheduleFormFromAppointment(appointment))
    setSubmitError(null)
    setShowScheduleModal(true)
  }

  const closeScheduleModal = () => {
    setShowScheduleModal(false)
    setSubmitting(false)
    setSubmitError(null)
  }

  const submitSchedule = async (event) => {
    event.preventDefault()

    if (!scheduleForm.clientId || !scheduleForm.professionalId || !scheduleForm.serviceId || !scheduleForm.startDate || !scheduleForm.startTime) {
      setSubmitError('Preencha cliente, profissional, servico, data e hora.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      clientId: scheduleForm.clientId,
      professionalId: scheduleForm.professionalId,
      serviceId: scheduleForm.serviceId,
      startTime: `${scheduleForm.startDate}T${scheduleForm.startTime}:00`,
      status: scheduleForm.status,
      unit: scheduleForm.unit,
    }

    try {
      if (scheduleModalMode === 'edit' && scheduleForm.appointmentId) {
        await fetchJson(`/appointments/public/${scheduleForm.appointmentId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await fetchJson('/appointments/public', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }

      await refreshAppointments()
      closeScheduleModal()
    } catch (submitAppointmentError) {
      setSubmitError(submitAppointmentError.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return <section className="calendar-page"><p>A carregar eventos do calendario...</p></section>
  }

  if (error) {
    return <section className="calendar-page"><p>Erro ao carregar o calendario: {error}</p></section>
  }

// Renderizacao principal
  return (
    <section className="calendar-page" aria-label="Calendario">
      <div className="calendar-header">
        <div>
          <h1>Calendario</h1>
          <p>Visualize os agendamentos e acompanhe os eventos da equipa em tempo real.</p>
        </div>
        <button type="button" className="calendar-schedule-button" onClick={openCreateScheduleModal}>
          <span>Novo agendamento</span>
        </button>
      </div>

      <div className="calendar-summary-grid">
        <article className="calendar-summary-card">
          <span className="calendar-summary-label">Agendados</span>
          <strong>{statusSummary.scheduled}</strong>
        </article>
        <article className="calendar-summary-card">
          <span className="calendar-summary-label">Concluidos</span>
          <strong>{statusSummary.completed}</strong>
        </article>
        <article className="calendar-summary-card">
          <span className="calendar-summary-label">Cancelados</span>
          <strong>{statusSummary.cancelled}</strong>
        </article>
      </div>

      <div className="calendar-layout">
        <div className="calendar-board-shell">
          <div className="calendar-board-topbar">
            <div>
              <h2>Agenda visual</h2>
              <p>Ao clicar num agendamento, voce pode rever e editar os dados imediatamente.</p>
            </div>
            <span className="calendar-buffer-chip">Intervalo minimo de {APPOINTMENT_BUFFER_MINUTES} min</span>
          </div>

          <div className="calendar-board">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              locale={ptLocale}
              initialView="timeGridWeek"
              height={780}
              contentHeight={760}
              expandRows
              nowIndicator
              allDaySlot={false}
              slotMinTime="07:00:00"
              slotMaxTime="23:00:00"
              slotDuration="00:30:00"
              slotLabelInterval="01:00"
              events={calendarEvents}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              buttonText={{
                today: 'Hoje',
                month: 'Mes',
                week: 'Semana',
                day: 'Dia',
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
              }}
              eventClick={(info) => {
                const clickedAppointment = appointments.find(
                  (appointment) => (appointment._id || appointment.id) === info.event.id
                )

                if (clickedAppointment) {
                  openEditScheduleModal(clickedAppointment)
                }
              }}
            />
          </div>
        </div>

        <aside className="calendar-details-card" aria-label="Detalhes do evento">
          <div className="calendar-details-header">
            <h2>Detalhes do agendamento</h2>
            <p>Selecione um evento para ver cliente, profissional, horario e observacoes.</p>
          </div>

          {selectedAppointment ? (
            <div className="calendar-details-content">
              <div className="calendar-detail-block">
                <span className="calendar-detail-label">Cliente</span>
                <strong>{selectedAppointment?.client?.name || 'Cliente nao definido'}</strong>
              </div>
              <div className="calendar-detail-block">
                <span className="calendar-detail-label">Profissional</span>
                <strong>{selectedAppointment?.professional?.name || 'Profissional nao definido'}</strong>
              </div>
              <div className="calendar-detail-block">
                <span className="calendar-detail-label">Servico</span>
                <strong>{selectedAppointment?.service?.name || 'Servico nao definido'}</strong>
              </div>
              <div className="calendar-detail-block">
                <span className="calendar-detail-label">Estado</span>
                <strong>{formatStatusLabel(selectedAppointment.status)}</strong>
              </div>
              <div className="calendar-detail-block">
                <span className="calendar-detail-label">Unidade</span>
                <strong>{formatUnitLabel(selectedAppointment.unit)}</strong>
              </div>
              <div className="calendar-detail-block">
                <span className="calendar-detail-label">Inicio</span>
                <strong>{selectedAppointment.startTime ? new Date(selectedAppointment.startTime).toLocaleString('pt-PT') : 'Nao definido'}</strong>
              </div>
              <div className="calendar-detail-block">
                <span className="calendar-detail-label">Fim</span>
                <strong>{selectedAppointment.endTime ? new Date(selectedAppointment.endTime).toLocaleString('pt-PT') : 'Nao definido'}</strong>
              </div>
              <div className="calendar-detail-block">
                <span className="calendar-detail-label">Observacoes</span>
                <p>{selectedAppointment.notes || 'Sem observacoes adicionais.'}</p>
              </div>
              <button type="button" className="calendar-edit-button" onClick={() => openEditScheduleModal(selectedAppointment)}>
                Editar agendamento
              </button>
            </div>
          ) : (
            <div className="calendar-empty-state">
              <p>Clique num evento para abrir a edicao e visualizar as informacoes com mais detalhe.</p>
            </div>
          )}
        </aside>
      </div>

      {showScheduleModal && (
        <div className="calendar-modal-backdrop" onClick={closeScheduleModal}>
          <div className="calendar-modal" onClick={(modalEvent) => modalEvent.stopPropagation()}>
            <div className="calendar-modal-header">
              <div>
                <h2>{scheduleModalMode === 'edit' ? 'Editar agendamento' : 'Criar agendamento'}</h2>
                <p>
                  {scheduleModalMode === 'edit'
                    ? `Atualize os dados do atendimento. O sistema respeita um intervalo minimo de ${APPOINTMENT_BUFFER_MINUTES} minutos entre agendamentos.`
                    : `Registe um novo evento com um intervalo minimo de ${APPOINTMENT_BUFFER_MINUTES} minutos entre atendimentos.`}
                </p>
              </div>
              <button type="button" className="calendar-modal-close" onClick={closeScheduleModal} aria-label="Fechar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>
              </button>
            </div>

            <form className="calendar-form" onSubmit={submitSchedule}>
              <label className="calendar-field">
                <span>Cliente</span>
                <input
                  type="search"
                  name="clientSearch"
                  value={scheduleForm.clientSearch}
                  onChange={updateScheduleField}
                  placeholder="Pesquisar cliente por nome"
                />
                <div className="calendar-search-results">
                  {filteredClients.slice(0, 5).map((client) => (
                    <button
                      key={client._id || client.id}
                      type="button"
                      className={`calendar-search-item ${scheduleForm.clientId === (client._id || client.id) ? 'is-active' : ''}`}
                      onClick={() => selectClient(client)}
                    >
                      <strong>{client.name}</strong>
                      <small>{client.email || client.phone || 'Cliente'}</small>
                    </button>
                  ))}
                </div>
              </label>

              <label className="calendar-field">
                <span>Profissional</span>
                <select name="professionalId" value={scheduleForm.professionalId} onChange={updateScheduleField}>
                  <option value="">Selecione um profissional</option>
                  {professionals.map((professional) => (
                    <option key={professional._id || professional.id} value={professional._id || professional.id}>
                      {professional.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="calendar-field">
                <span>Unidade</span>
                <select name="unit" value={scheduleForm.unit} onChange={updateScheduleField}>
                  {UNIT_OPTIONS.map((unitOption) => (
                    <option key={unitOption.value} value={unitOption.value}>
                      {unitOption.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="calendar-field">
                <span>Servico</span>
                <input
                  type="search"
                  name="serviceSearch"
                  value={scheduleForm.serviceSearch}
                  onChange={updateScheduleField}
                  placeholder="Pesquisar servico por nome"
                />
                <div className="calendar-search-results">
                  {filteredServices.slice(0, 6).map((service) => (
                    <button
                      key={service._id || service.id}
                      type="button"
                      className={`calendar-search-item ${scheduleForm.serviceId === (service._id || service.id) ? 'is-active' : ''}`}
                      onClick={() => selectService(service)}
                    >
                      <strong>{service.name || service.nome}</strong>
                      <small>{service.durationMinutes || service.duration || 0} min</small>
                    </button>
                  ))}
                </div>
              </label>

              {scheduleModalMode === 'edit' && (
                <label className="calendar-field">
                  <span>Estado</span>
                  <select name="status" value={scheduleForm.status} onChange={updateScheduleField}>
                    <option value="scheduled">Agendado</option>
                    <option value="completed">Concluido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </label>
              )}

              <div className="calendar-form-grid">
                <label className="calendar-field">
                  <span>Data</span>
                  <input type="date" name="startDate" value={scheduleForm.startDate} onChange={updateScheduleField} />
                </label>

                <label className="calendar-field">
                  <span>Hora</span>
                  <input type="time" name="startTime" value={scheduleForm.startTime} onChange={updateScheduleField} />
                </label>
              </div>

              {submitError && <p className="calendar-form-feedback is-error">{submitError}</p>}

              <div className="calendar-form-actions">
                <button type="button" className="calendar-secondary-button" onClick={closeScheduleModal}>Cancelar</button>
                <button type="submit" className="calendar-primary-button" disabled={submitting}>
                  <span>{submitting ? 'A guardar...' : scheduleModalMode === 'edit' ? 'Guardar alteracoes' : 'Guardar agendamento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// Exportacao principal
export default Calendario
