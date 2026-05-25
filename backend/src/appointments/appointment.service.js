/* ======================================== */
/* ARQUIVO: BACKEND/SRC/APPOINTMENTS/APPOINTMENT.SERVICE.JS */
/* ======================================== */

// Importacoes
import Appointment from './appointment.model.js';

// Bloco: APPOINTMENT_BUFFER_MINUTES
const APPOINTMENT_BUFFER_MINUTES = 10;

// Funcao: applyAppointmentBuffer
const applyAppointmentBuffer = (startTime, endTime) => {
  const bufferMs = APPOINTMENT_BUFFER_MINUTES * 60 * 1000;

  return {
    bufferedStart: new Date(startTime.getTime() - bufferMs),
    bufferedEnd: new Date(endTime.getTime() + bufferMs)
  };
};

// Funcao exportada: createAppointment
export const createAppointment = (data) => {
  return Appointment.create(data);
};

// Funcao exportada: findConflictingAppointment
export const findConflictingAppointment = (professionalId, startTime, endTime) => {
  const { bufferedStart, bufferedEnd } = applyAppointmentBuffer(startTime, endTime);

  return Appointment.findOne({
    professional: professionalId,
    status: { $ne: 'cancelled' },
    startTime: { $lt: bufferedEnd },
    endTime: { $gt: bufferedStart }
  });
};

// Funcao exportada: findConflictingAppointmentExcluding
export const findConflictingAppointmentExcluding = (
  appointmentId,
  professionalId,
  startTime,
  endTime
) => {
  const { bufferedStart, bufferedEnd } = applyAppointmentBuffer(startTime, endTime);

  return Appointment.findOne({
    _id: { $ne: appointmentId },
    professional: professionalId,
    status: { $ne: 'cancelled' },
    startTime: { $lt: bufferedEnd },
    endTime: { $gt: bufferedStart }
  });
};

// Funcao exportada: listAppointmentsByProfessional
export const listAppointmentsByProfessional = (professionalId) => {
  return Appointment.find({ professional: professionalId })
    .sort({ startTime: 1 })
    .populate('client', 'name email phone avatar')
    .populate('service', 'name');
};

// Funcao exportada: listAppointmentsByClient
export const listAppointmentsByClient = (clientId) => {
  return Appointment.find({ client: clientId })
    .sort({ startTime: 1 })
    .populate('professional', 'name email')
    .populate('service', 'name');
};

// Funcao exportada: listAllAppointments
export const listAllAppointments = () => {
  return Appointment.find({})
    .sort({ startTime: 1 })
    .populate('client', 'name email phone avatar')
    .populate('professional', 'name email')
    .populate('service', 'name durationMinutes maxDurationMinutes');
};

// Funcao exportada: findAppointmentById
export const findAppointmentById = (appointmentId) => {
  return Appointment.findById(appointmentId);
};

// Funcao exportada: updateAppointmentStatus
export const updateAppointmentStatus = (appointmentId, status) => {
  return Appointment.findByIdAndUpdate(
    appointmentId,
    { status },
    { new: true }
  );
};

// Funcao exportada: updateAppointment
export const updateAppointment = (appointmentId, data) => {
  return Appointment.findByIdAndUpdate(appointmentId, data, { new: true });
};

