const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');  // ← importante: ./src/config/db

dotenv.config();
connectDB();

const app = express();

// Config CORS (se você tiver corsOptions em src/config/cors.js, importe e use)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));  // pasta uploads na raiz

// Importar rotas (todas dentro de src/routes/)
const authRoutes         = require('./src/routes/authRoutes');
const categoryRoutes     = require('./src/routes/categoryRoutes');
const serviceRoutes      = require('./src/routes/serviceRoutes');
const appointmentRoutes  = require('./src/routes/appointmentRoutes');
const staffRoutes        = require('./src/routes/staffRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API Sobrancelha Express rodando com sucesso! 🚀');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log('MongoDB deve conectar em seguida...');
});