/* ======================================== */
/* ARQUIVO: BACKEND/SRC/APP.JS */
/* ======================================== */

// Importacoes
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';

// Bloco: app
const app = express();

// Bloco: __filename
const __filename = fileURLToPath(import.meta.url);

// Bloco: __dirname
const __dirname = path.dirname(__filename);

// Bloco: uploadsPath
const uploadsPath = path.resolve(__dirname, '../uploads');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ====================
// Pasta publica de uploads
// ====================
app.use('/uploads', express.static(uploadsPath));
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API rodando' });
});

// Exportacao principal
export default app;

