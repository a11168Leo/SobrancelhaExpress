const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  // Referência para a categoria pai (Se null, é Categoria Principal)
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null 
  },
  
  // Nível para os filtros (1: Cat, 2: Sub1, 3: Sub2, 4: Sub3)
  level: { 
    type: Number, 
    enum: [1, 2, 3, 4], 
    default: 1 
  },

  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);