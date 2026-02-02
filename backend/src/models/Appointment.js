const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Relacionamentos
  clienteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  profissionalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  servicoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service', 
    required: true 
  },

  // Dados do Horário
  start: { 
    type: Date, 
    required: true 
  }, // 'start' é o padrão do FullCalendar
  end: { 
    type: Date, 
    required: true 
  },   // 'end' é calculado somando a duração do serviço

  status: { 
    type: String, 
    enum: ['pendente', 'confirmado', 'concluido', 'cancelado'], 
    default: 'pendente' 
  },

  // Notas e Ficha Técnica
  observacoes: { 
    type: String 
  },
  
  // Para o FullCalendar colorir no mapa visual
  color: { 
    type: String, 
    default: '#3788d8' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);