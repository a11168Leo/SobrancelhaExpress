const Appointment = require('../models/Appointment');

/**
 * Verifica se o profissional está disponível no intervalo desejado
 * @returns {Promise<boolean>} true = disponível
 */
const checkAvailability = async (professionalId, startDateTime, endDateTime) => {
  try {
    const conflicting = await Appointment.find({
      professionalId,
      status: { $ne: 'cancelado' },
      $or: [
        // Novo agendamento começa durante um existente
        { start: { $lt: endDateTime }, end: { $gt: startDateTime } },
      ]
    });

    return conflicting.length === 0;
  } catch (err) {
    console.error('Erro ao verificar disponibilidade:', err);
    return false;
  }
};

module.exports = { checkAvailability };