
/*
====================
SECAO INTERNA PADRAO
====================
*/

import mongoose from 'mongoose';




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





