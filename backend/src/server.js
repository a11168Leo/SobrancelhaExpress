/* ======================================== */
/* ARQUIVO: BACKEND/SRC/SERVER.JS */
/* ======================================== */

// Importacoes
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

// Bloco: PORT
const PORT = process.env.PORT || 3333;

// Bloco: startServer
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(` Servidor rodando na porta ${PORT}`);
  });
};

startServer();

