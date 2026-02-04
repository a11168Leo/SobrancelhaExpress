import mongoose from 'mongoose';

// Configurações gerais do sistema
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

export default mongoose.model('Settings', SettingsSchema);
