const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'professional', 'client'], 
    default: 'client' 
  },
  // Campo de foto: Opcional para Admin/Profissional, irrelevante para Cliente
  profileImage: { 
    type: String, 
    default: null 
  },
  specialties: [String] 
}, { timestamps: true });

// Encriptação automática antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);