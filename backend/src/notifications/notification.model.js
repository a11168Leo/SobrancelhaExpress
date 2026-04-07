/* ======================================== */
/* ARQUIVO: BACKEND/SRC/NOTIFICATIONS/NOTIFICATION.MODEL.JS */
/* ======================================== */

// Importacoes
import mongoose from 'mongoose';

// Bloco: NotificationSchema
const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Exportacao principal
export default mongoose.model('Notification', NotificationSchema);

