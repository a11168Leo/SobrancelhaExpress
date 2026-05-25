/* ======================================== */
/* ARQUIVO: BACKEND/SRC/CATEGORIES/CATEGORY.MODEL.JS */
/* ======================================== */

// Importacoes
import mongoose from 'mongoose';

// Bloco: CategorySchema
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    }
  },
  { timestamps: true }
);

CategorySchema.index({ name: 1, level: 1, parent: 1 }, { unique: true });

// Exportacao principal
export default mongoose.model('Category', CategorySchema);

