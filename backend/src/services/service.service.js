
/*
====================
SECAO INTERNA PADRAO
====================
*/

import Service from './service.model.js';




export const createService = (data) => {
  return Service.create(data);
};




export const findServiceById = (id) => {
  return Service.findById(id);
};




export const listServices = (filters = {}) => {
  return Service.find(filters).sort({ name: 1 });
};




export const updateService = (id, data) => {
  return Service.findByIdAndUpdate(id, data, { new: true });
};




export const deleteService = (id) => {
  return Service.findByIdAndDelete(id);
};





