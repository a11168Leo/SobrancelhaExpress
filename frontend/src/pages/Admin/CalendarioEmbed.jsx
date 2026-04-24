/* ======================================== */
/* ARQUIVO: FRONTEND/SRC/PAGES/CALENDARIOEMBED.JSX */
/* ======================================== */
/* Componente: Calendário semanal simplificado para Dashboard */

import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import ptLocale from '@fullcalendar/core/locales/pt'
import { fetchJson } from '../../services/api'
import '../../styles/pages/Profissional/CalendarioEmbed.css'

/**
 * Componente de Calendário Simplificado
 * Renderiza o FullCalendar em visão semanal para o Dashboard
 */
function CalendarioEmbed() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadCalendarData() {
      try {
        const response = await fetchJson('/appointments/calendar')
        const items = Array.isArray(response) ? response : response?.appointments || []

        const events = items.map((appointment) => ({
          id: appointment._id || appointment.id,
          title: `${appointment.client?.name || 'Cliente'}${appointment.service?.name ? ` - ${appointment.service.name}` : ''}`,
          start: appointment.startTime,
          end: appointment.endTime || new Date(new Date(appointment.startTime).getTime() + 60 * 60 * 1000).toISOString(),
          backgroundColor: appointment.status === 'completed' ? '#67c690' : '#c95184',
          borderColor: appointment.status === 'completed' ? '#2f7d55' : '#ad385a',
          textColor: '#ffffff',
          extendedProps: {
            status: appointment.status,
          },
        }))

        setAppointments(events)
        setError(null)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }

    loadCalendarData()
  }, [])

  if (loading) {
    return <div className="calendar-embed-loading">Carregando calendário...</div>
  }

  if (error) {
    return <div className="calendar-embed-error">Erro ao carregar calendário: {error}</div>
  }

  return (
    <div className="calendar-embed-wrapper">
      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        locale={ptLocale}
        events={appointments}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        height="auto"
        contentHeight="auto"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false,
        }}
        slotDuration="00:30:00"
        slotLabelInterval="00:30:00"
        weekends={true}
        nowIndicator={true}
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        eventDisplay="block"
        eventClick={() => {
          // Click handler vazio - apenas para evitar comportamentos padrão
        }}
      />
    </div>
  )
}

export default CalendarioEmbed
