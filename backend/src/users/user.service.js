/* ======================================== */
/* ARQUIVO: BACKEND/SRC/USERS/USER.SERVICE.JS */
/* ======================================== */

// Importacoes
import User from './user.model.js';

// Funcao exportada: findUserByEmail
export const findUserByEmail = (email) => {
  return User.findOne({ email }).select('+password');
};

// Funcao exportada: createUser
export const createUser = (data) => {
  return User.create(data);
};

// Funcao exportada: findUserById
export const findUserById = (id) => {
  return User.findById(id).select('-password');
};

// Funcao exportada: updateUserById
export const updateUserById = (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};

// Funcao exportada: listUsers
export const listUsers = (filters = {}) => {
  return User.find(filters).select('-password').sort({ name: 1 });
};

// Funcao exportada: deleteUserById
export const deleteUserById = (id) => {
  return User.findByIdAndDelete(id);
};

