/* ======================================== */
/* ARQUIVO: BACKEND/SRC/SETTINGS/SETTINGS.MODEL.JS */
/* ======================================== */

// Importacoes
import mongoose from 'mongoose';

// Bloco: SettingsSchema
const SettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    data: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

// Exportacao principal
export default mongoose.model('Settings', SettingsSchema);

