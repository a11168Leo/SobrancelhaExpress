const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  durationMinutes: { type: Number, required: true },
  // Conecta ao nível mais profundo da categoria selecionada
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);