
/*
====================
SECAO INTERNA PADRAO
====================
*/

import mongoose from 'mongoose';




const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    price: {
      type: Number,
      required: true
    },
    durationMinutes: {
      type: Number,
      required: true
    },
    // ====================
    // Duracao maxima (opcional, usada quando ha intervalo)
    // ====================
    maxDurationMinutes: {
      type: Number,
      default: null
    },
    // ====================
    // Categoria principal (level 0)
    // ====================
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    // ====================
    // Subcategoria (level 1)
    // ====================
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    // ====================
    // Subcategoria2 (level 2)
    // ====================
    subcategory2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    // ====================
    // Subcategoria3 (level 3)
    // ====================
    subcategory3: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    // ====================
    // Profissional dono do serviÃ§o (opcional)
    // ====================
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    imageUrl: String,
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Service', ServiceSchema);





