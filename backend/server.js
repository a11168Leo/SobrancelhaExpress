const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db'); // Verifique se o caminho do seu DB está correto

// 1. Carregar variáveis de ambiente
dotenv.config();

// 2. Conectar ao Banco de Dados
connectDB();

// 3. INICIALIZAR o app (Isso deve vir ANTES das rotas)
const app = express();

// 4. Middlewares globais
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 5. Importar as Rotas
const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const staffRoutes = require('./src/routes/staffRoutes');

// 6. Usar as Rotas (Agora o 'app' já existe, então não dará erro)
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff', staffRoutes);

// 7. Porta e Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));