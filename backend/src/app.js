
/*
====================
SECAO INTERNA PADRAO
====================
*/

import express from 'express';
import cors from 'cors';
import routes from './routes.js';

const app = express();




app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ====================
// Pasta publica de uploads
// ====================
app.use('/uploads', express.static('uploads'));
app.use('/api', routes);




app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API rodando' });
});

export default app;





