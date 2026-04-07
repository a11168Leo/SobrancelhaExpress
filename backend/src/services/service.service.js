/* ======================================== */
/* ARQUIVO: BACKEND/SRC/SERVICES/SERVICE.SERVICE.JS */
/* ======================================== */

// Importacoes
import Service from './service.model.js';

// Funcao exportada: createService
export const createService = (data) => {
  return Service.create(data);
};

// Funcao exportada: findServiceById
export const findServiceById = (id) => {
  return Service.findById(id);
};

// Funcao exportada: listServices
export const listServices = (filters = {}) => {
  return Service.find(filters).sort({ name: 1 });
};

// Funcao exportada: updateService
export const updateService = (id, data) => {
  return Service.findByIdAndUpdate(id, data, { new: true });
};

// Funcao exportada: deleteService
export const deleteService = (id) => {
  return Service.findByIdAndDelete(id);
};

