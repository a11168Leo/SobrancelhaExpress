/* ======================================== */
/* ARQUIVO: BACKEND/SRC/SEED/SEED.ADMIN.JS */
/* ======================================== */

// Importacoes
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../users/user.model.js';

// Bloco: ADMIN_EMAIL
const ADMIN_EMAIL = 'admin@.com';

// Bloco: ADMIN_PASSWORD
const ADMIN_PASSWORD = 'admin';

// Bloco: seedAdmin
const seedAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin ja existe:', ADMIN_EMAIL);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.create({
    name: 'Administrador',
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin'
  });

  console.log('Admin criado com sucesso:', ADMIN_EMAIL);
  await mongoose.disconnect();
};

seedAdmin().catch((error) => {
  console.error('Erro ao criar admin:', error);
  mongoose.disconnect();
  process.exit(1);
});

