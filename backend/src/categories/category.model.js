import mongoose from 'mongoose';

// Modelo de categoria com 4 níveis: categoria, subcategoria, subcategoria2, subcategoria3
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

// Evita categorias duplicadas no mesmo nível e mesmo pai
CategorySchema.index({ name: 1, level: 1, parent: 1 }, { unique: true });

export default mongoose.model('Category', CategorySchema);
