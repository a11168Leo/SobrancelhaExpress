import User from './user.model.js';

// Busca usuario pelo email (inclui senha)
export const findUserByEmail = (email) => {
  return User.findOne({ email }).select('+password');
};

// Cria usuario
export const createUser = (data) => {
  return User.create(data);
};

// Busca usuario pelo id (sem senha)
export const findUserById = (id) => {
  return User.findById(id).select('-password');
};

// Atualiza usuario
export const updateUserById = (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};

// Lista usuarios com filtros
export const listUsers = (filters = {}) => {
  return User.find(filters).select('-password').sort({ name: 1 });
};
