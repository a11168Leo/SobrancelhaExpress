import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../../services/api";
import { getProfessionalId } from "../../services/authGuard";

export default function Appointments() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const professionalId = getProfessionalId();
        const res = await api.get(`/appointments/${professionalId}`);
        const formatted = res.data.map((appt) => ({
          id: appt._id,
          title: `${appt.client.name} - ${appt.service.name}`,
          start: appt.start
        }));
        setEvents(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAppointments();
  }, []);

  const handleDateClick = (info) => {
    const clientName = prompt("Nome do Cliente:");
    const serviceName = prompt("Serviço:");
    if (clientName && serviceName) {
      const newEvent = { title: `${clientName} - ${serviceName}`, start: info.dateStr };
      setEvents([...events, newEvent]);
    }
  };

  return (
    <div>
      <h1>Agendamentos</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
        events={events}
        dateClick={handleDateClick}
      />
    </div>
  );
}
