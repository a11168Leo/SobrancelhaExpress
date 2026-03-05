
/*
====================
SECAO INTERNA PADRAO
====================
*/

import Appointment from './appointment.model.js';




export const createAppointment = (data) => {
  return Appointment.create(data);
};




export const findConflictingAppointment = (professionalId, startTime, endTime) => {
  return Appointment.findOne({
    professional: professionalId,
    status: { $ne: 'cancelled' },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  });
};




export const findConflictingAppointmentExcluding = (
  appointmentId,
  professionalId,
  startTime,
  endTime
) => {
  return Appointment.findOne({
    _id: { $ne: appointmentId },
    professional: professionalId,
    status: { $ne: 'cancelled' },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  });
};




export const listAppointmentsByProfessional = (professionalId) => {
  return Appointment.find({ professional: professionalId })
    .sort({ startTime: 1 })
    .populate('client', 'name email phone avatar')
    .populate('service', 'name');
};




export const listAppointmentsByClient = (clientId) => {
  return Appointment.find({ client: clientId })
    .sort({ startTime: 1 })
    .populate('professional', 'name email')
    .populate('service', 'name');
};




export const listAllAppointments = () => {
  return Appointment.find({})
    .sort({ startTime: 1 })
    .populate('client', 'name email phone avatar')
    .populate('professional', 'name email')
    .populate('service', 'name durationMinutes maxDurationMinutes');
};




export const findAppointmentById = (appointmentId) => {
  return Appointment.findById(appointmentId);
};




export const updateAppointmentStatus = (appointmentId, status) => {
  return Appointment.findByIdAndUpdate(
    appointmentId,
    { status },
    { new: true }
  );
};




export const updateAppointment = (appointmentId, data) => {
  return Appointment.findByIdAndUpdate(appointmentId, data, { new: true });
};





