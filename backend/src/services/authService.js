const User = require('../models/User');

// Centraliza a busca de usuário para evitar repetição nos controllers
const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

module.exports = { findUserByEmail };