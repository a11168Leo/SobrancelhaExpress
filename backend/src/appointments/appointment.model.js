import mongoose from 'mongoose';

// Modelo de agendamento
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
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', AppointmentSchema);
