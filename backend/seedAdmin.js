const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['admin', 'professional', 'client'], default: 'client' }
});

// Versão simplificada do Hash para o Seed
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/SobrancelhaExpress';
    await mongoose.connect(uri);
    console.log("📡 Conectado ao MongoDB...");

    await User.deleteOne({ email: 'leonardo_nogueira.ll@hotmail.com' });

    await User.create({
      name: 'Leonardo Nogueira',
      email: 'leonardo_nogueira.ll@hotmail.com',
      password: '123456', 
      phone: '11999999999',
      role: 'admin'
    });

    console.log("\n✅ ADMIN CRIADO COM SUCESSO!");
    console.log("📧 Email: leonardo_nogueira.ll@hotmail.com");
    console.log("🔑 Senha: 123456\n");

  } catch (err) {
    console.error("❌ Erro no seed:", err.message);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
}

seed();