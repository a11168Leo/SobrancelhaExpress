import Appointment from './appointment.model.js';

// Cria um novo agendamento
export const createAppointment = (data) => {
  return Appointment.create(data);
};

// Procura conflito de horário para uma profissional
export const findConflictingAppointment = (professionalId, startTime, endTime) => {
  return Appointment.findOne({
    professional: professionalId,
    status: { $ne: 'cancelled' },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  });
};

// Procura conflito ignorando um agendamento especifico
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

// Lista agenda de uma profissional
export const listAppointmentsByProfessional = (professionalId) => {
  return Appointment.find({ professional: professionalId })
    .sort({ startTime: 1 })
    .populate('client', 'name email')
    .populate('service', 'name');
};

// Lista agenda de um cliente
export const listAppointmentsByClient = (clientId) => {
  return Appointment.find({ client: clientId })
    .sort({ startTime: 1 })
    .populate('professional', 'name email')
    .populate('service', 'name');
};

// Lista todos os agendamentos (admin)
export const listAllAppointments = () => {
  return Appointment.find({})
    .sort({ startTime: 1 })
    .populate('client', 'name email')
    .populate('professional', 'name email')
    .populate('service', 'name durationMinutes maxDurationMinutes');
};

// Busca agendamento por id
export const findAppointmentById = (appointmentId) => {
  return Appointment.findById(appointmentId);
};

// Atualiza status do agendamento
export const updateAppointmentStatus = (appointmentId, status) => {
  return Appointment.findByIdAndUpdate(
    appointmentId,
    { status },
    { new: true }
  );
};

// Atualiza dados do agendamento
export const updateAppointment = (appointmentId, data) => {
  return Appointment.findByIdAndUpdate(appointmentId, data, { new: true });
};
