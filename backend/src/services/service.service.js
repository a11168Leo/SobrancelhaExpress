import Service from './service.model.js';

// Cria serviço
export const createService = (data) => {
  return Service.create(data);
};

// Busca serviço por id
export const findServiceById = (id) => {
  return Service.findById(id);
};

// Lista serviços com filtros simples
export const listServices = (filters = {}) => {
  return Service.find(filters).sort({ name: 1 });
};

// Atualiza serviço
export const updateService = (id, data) => {
  return Service.findByIdAndUpdate(id, data, { new: true });
};

// Remove serviço
export const deleteService = (id) => {
  return Service.findByIdAndDelete(id);
};
