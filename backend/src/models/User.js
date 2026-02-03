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
  profileImage: { type: String, default: null },
  specialties: [String] 
}, { timestamps: true });

// Middleware de hash da senha – usando callbacks para máxima compatibilidade
userSchema.pre('save', function(next) {
  // Se a senha não foi modificada, pula o hash
  if (!this.isModified('password')) {
    return next();
  }

  // Gera salt
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return next(err); // passa erro para Mongoose
    }

    // Hash da senha com o salt
    bcrypt.hash(this.password, salt, function(err, hash) {
      if (err) {
        return next(err); // passa erro para Mongoose
      }

      // Substitui a senha plain-text pelo hash
      this.password = hash;
      next(); // sucesso → continua o save
    });
  });
});

// Método para comparar senhas no login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);