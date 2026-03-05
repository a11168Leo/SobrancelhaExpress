
/*
====================
SECAO INTERNA PADRAO
====================
*/

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('âœ… MongoDB conectado');
  } catch (error) {
    console.error('âŒ Erro ao conectar no MongoDB:', error);
    process.exit(1);
  }
};



