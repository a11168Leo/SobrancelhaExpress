/* ======================================== */
/* ARQUIVO: BACKEND/SRC/AUTH/JWT.JS */
/* ======================================== */

// Importacoes
import jwt from 'jsonwebtoken';

// Funcao exportada: generateToken
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

