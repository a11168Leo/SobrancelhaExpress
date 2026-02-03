const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
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

    status: {
      type: String,
      enum: ['pendente', 'confirmado', 'concluido', 'cancelado'],
      default: 'confirmado'
    },

    color: {
      type: String,
      default: '#D988B3'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
