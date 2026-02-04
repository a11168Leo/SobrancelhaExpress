import express from 'express';
import cors from 'cors';
import routes from './routes.js';

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Pasta publica de uploads
app.use('/uploads', express.static('uploads'));
app.use('/api', routes);

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API rodando' });
});

export default app;
