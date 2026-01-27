import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Plus, X, Clock, User, Scissors, Loader2 } from "lucide-react";
import api from "../../services/api"; // Sua instância do Axios
import { getProfessionalId } from "../../services/authGuard";
import "../css/calendar.css";

export default function Appointments() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [newAppt, setNewAppt] = useState({ client: '', service: '', time: '09:00' });

  // --- BUSCAR DADOS DA API ---
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const professionalId = getProfessionalId();
      
      // Chamada para sua rota de agendamentos
      const res = await api.get(`/appointments/${professionalId}`);
      
      // Formatação para o FullCalendar entender
      const formatted = res.data.map((appt) => ({
        id: appt._id,
        // Título que aparece no card do calendário
        title: `${appt.client?.name || 'Cliente'} - ${appt.service?.name || 'Serviço'}`,
        // O FullCalendar aceita strings ISO (ex: 2026-01-27T10:00:00)
        start: appt.start, 
        end: appt.end, // Caso você tenha horário de término
        backgroundColor: appt.status === 'confirmado' ? '#D988B3' : '#333',
        borderColor: 'transparent',
        extendedProps: { ...appt } // Dados extras caso queira abrir um detalhe depois
      }));
      
      setEvents(formatted);
    } catch (err) {
      console.error("Erro ao carregar agenda:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // --- SALVAR NOVO AGENDAMENTO NA BASE ---
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const professionalId = getProfessionalId();
      const eventDateTime = `${selectedDate}T${newAppt.time}:00`;

      const payload = {
        professionalId,
        clientName: newAppt.client,
        serviceName: newAppt.service,
        start: eventDateTime,
        status: 'pendente'
      };

      await api.post('/appointments', payload);
      
      // Recarrega a lista do banco para garantir sincronia
      await fetchAppointments();
      setShowModal(false);
      setNewAppt({ client: '', service: '', time: '09:00' });
      alert("Agendamento realizado com sucesso! ✨");
    } catch (err) {
      alert("Erro ao salvar agendamento.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (info) => {
    // Pega a data clicada (formato YYYY-MM-DD)
    setSelectedDate(info.dateStr.split('T')[0]);
    setShowModal(true);
  };

  return (
    <div className="calendar-container acc-fade-in">
      <div className="calendar-header">
        <div>
          <h1 className="acc-main-title">Agenda Profissional</h1>
          <p className="calendar-subtitle">Sincronizado com sua base de dados</p>
        </div>
        <button className="acc-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Novo Horário
        </button>
      </div>

      <div className="calendar-card">
        {loading && (
          <div className="calendar-loading-overlay">
            <Loader2 className="animate-spin" size={40} color="#D988B3" />
          </div>
        )}
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={ptBrLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          events={events}
          dateClick={handleDateClick}
          height="75vh"
          nowIndicator={true}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
          }}
        />
      </div>

      {/* Modal permanece igual, mas agora chama a API ao salvar */}
      {showModal && (
        <div className="cal-modal-overlay">
          <div className="cal-modal-content acc-fade-in">
            <div className="cal-modal-header">
              <h3>Novo Agendamento</h3>
              <X className="close-icon" onClick={() => setShowModal(false)} />
            </div>
            
            <form onSubmit={handleSave} className="cal-form">
              <div className="acc-input-group">
                <label><User size={14} /> Cliente</label>
                <input required className="acc-input" value={newAppt.client} onChange={e => setNewAppt({...newAppt, client: e.target.value})} />
              </div>

              <div className="acc-input-group">
                <label><Scissors size={14} /> Serviço</label>
                <input required className="acc-input" value={newAppt.service} onChange={e => setNewAppt({...newAppt, service: e.target.value})} />
              </div>

              <div className="acc-input-group">
                <label><Clock size={14} /> Horário</label>
                <input type="time" className="acc-input" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
              </div>

              <button type="submit" className="acc-btn-primary" disabled={loading}>
                {loading ? "Processando..." : "Confirmar Agendamento"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}