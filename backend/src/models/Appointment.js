const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  date: {
    type: String, 
    required: true
  },
  startTime: {
    type: String, 
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'confirmado', 'concluido', 'cancelado'],
    default: 'pendente'
  },
  observacoes: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3788d8'
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);