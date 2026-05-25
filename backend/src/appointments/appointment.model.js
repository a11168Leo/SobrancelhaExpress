/* ======================================== */
/* ARQUIVO: BACKEND/SRC/APPOINTMENTS/APPOINTMENT.MODEL.JS */
/* ======================================== */

// Importacoes
import mongoose from 'mongoose';

// Bloco: AppointmentSchema
const AppointmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    unit: {
      type: String,
      enum: ['cascais', 'almada'],
      default: 'cascais'
    },
    notes: String
  },
  { timestamps: true }
);

// Exportacao principal
export default mongoose.model('Appointment', AppointmentSchema);

