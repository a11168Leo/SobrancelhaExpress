const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().required(),
    role: Joi.string().valid('client', 'professional', 'admin')
  });
  return schema.validate(data);
};

module.exports = { registerValidation };