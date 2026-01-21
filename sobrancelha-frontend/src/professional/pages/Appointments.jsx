import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../../services/api";

export default function Appointments() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/professional/appointments");
        const formatted = res.data.map((appt) => ({
          id: appt._id,
          title: `${appt.clientName} - ${appt.serviceName}`,
          start: appt.date,
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
      const newEvent = {
        title: `${clientName} - ${serviceName}`,
        start: info.dateStr,
      };
      setEvents([...events, newEvent]);
      // Aqui você pode chamar a API para salvar no backend
    }
  };

  return (
    <div>
      <h1>Agendamentos</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={handleDateClick}
      />
    </div>
  );
}
