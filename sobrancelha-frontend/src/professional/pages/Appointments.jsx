import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Plus } from 'lucide-react';

const Appointments = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
          <Plus size={20} /> Novo Agendamento
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={ptBrLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="70vh"
          events={[
            { title: 'Design - Ana Paula', start: '2024-01-21T10:00:00', end: '2024-01-21T11:00:00', backgroundColor: '#9333ea' },
            { title: 'Henna - Marcia', start: '2024-01-21T14:30:00', end: '2024-01-21T15:30:00', backgroundColor: '#9333ea' },
          ]}
          eventClick={(info) => alert('Cliente: ' + info.event.title)}
          selectable={true}
        />
      </div>
    </div>
  );
};

export default Appointments;