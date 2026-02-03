const Joi = require('joi');

const appointmentSchema = Joi.object({
  professionalId: Joi.string().required(),
  serviceId: Joi.string().required(),
  date: Joi.date().greater('now').required(), // Não aceita datas passadas
  startTime: Joi.string().regex(/^([0-9]{2}):([0-9]{2})$/).required(), // Formato HH:mm
});

module.exports = { appointmentSchema };