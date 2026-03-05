
/*
====================
SECAO INTERNA PADRAO
====================
*/

import Financial from './financial.model.js';




export const createFinancial = (data) => {
  return Financial.create(data);
};




export const findFinancialById = (id) => {
  return Financial.findById(id);
};




export const findFinancialByAppointment = (appointmentId) => {
  return Financial.findOne({ appointment: appointmentId });
};




export const listFinancials = (filters = {}) => {
  return Financial.find(filters).sort({ createdAt: -1 });
};




export const updateFinancialStatus = (id, status) => {
  return Financial.findByIdAndUpdate(id, { status }, { new: true });
};





