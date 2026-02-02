// Importação de bibliotecas
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Importação das nossas configurações internas
const connectDB = require('./src/config/db');
const corsOptions = require('./src/config/cors');

// 1. Carregar variáveis de ambiente do ficheiro .env
dotenv.config();

// 2. Conectar ao Banco de Dados MongoDB
connectDB();

// 3. Inicializar o aplicativo Express
const app = express();

// 4. Middlewares Globais
app.use(cors(corsOptions)); // Aplica a segurança para os seus dois sites
app.use(express.json());    // Permite que o servidor entenda JSON (dados enviados pelo site)

// 5. Rota de Teste (Para verificar se o servidor está online)
app.get('/', (req, res) => {
  res.send('🚀 API do SobrancelhaExpress está online!');
});

// 6. Configuração da Porta
const PORT = process.env.PORT || 5000;

// 7. Iniciar o Servidor
app.listen(PORT, () => {
  console.log(`📡 Servidor rodando em modo ${process.env.NODE_ENV} na porta ${PORT}`);
});