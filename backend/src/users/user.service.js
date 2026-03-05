
/*
====================
SECAO INTERNA PADRAO
====================
*/

import User from './user.model.js';




export const findUserByEmail = (email) => {
  return User.findOne({ email }).select('+password');
};




export const createUser = (data) => {
  return User.create(data);
};




export const findUserById = (id) => {
  return User.findById(id).select('-password');
};




export const updateUserById = (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};




export const listUsers = (filters = {}) => {
  return User.find(filters).select('-password').sort({ name: 1 });
};




export const deleteUserById = (id) => {
  return User.findByIdAndDelete(id);
};





