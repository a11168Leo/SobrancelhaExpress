require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());

// Rotas
const authRoutes = require('./src/routes/authRoutes');

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3333;
 

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
