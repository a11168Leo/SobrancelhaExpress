import Financial from './financial.model.js';

// Cria lançamento financeiro
export const createFinancial = (data) => {
  return Financial.create(data);
};

// Busca por id
export const findFinancialById = (id) => {
  return Financial.findById(id);
};

// Busca por appointment
export const findFinancialByAppointment = (appointmentId) => {
  return Financial.findOne({ appointment: appointmentId });
};

// Lista financeiro com filtros
export const listFinancials = (filters = {}) => {
  return Financial.find(filters).sort({ createdAt: -1 });
};

// Atualiza status
export const updateFinancialStatus = (id, status) => {
  return Financial.findByIdAndUpdate(id, { status }, { new: true });
};
