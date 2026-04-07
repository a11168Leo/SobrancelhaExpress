/* ======================================== */
/* ARQUIVO: BACKEND/SRC/FINANCIAL/FINANCIAL.SERVICE.JS */
/* ======================================== */

// Importacoes
import Financial from './financial.model.js';

// Funcao exportada: createFinancial
export const createFinancial = (data) => {
  return Financial.create(data);
};

// Funcao exportada: findFinancialById
export const findFinancialById = (id) => {
  return Financial.findById(id);
};

// Funcao exportada: findFinancialByAppointment
export const findFinancialByAppointment = (appointmentId) => {
  return Financial.findOne({ appointment: appointmentId });
};

// Funcao exportada: listFinancials
export const listFinancials = (filters = {}) => {
  return Financial.find(filters).sort({ createdAt: -1 });
};

// Funcao exportada: updateFinancialStatus
export const updateFinancialStatus = (id, status) => {
  return Financial.findByIdAndUpdate(id, { status }, { new: true });
};

