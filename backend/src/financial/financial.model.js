/* ======================================== */
/* ARQUIVO: BACKEND/SRC/FINANCIAL/FINANCIAL.MODEL.JS */
/* ======================================== */

// Importacoes
import mongoose from 'mongoose';

// Bloco: FinancialSchema
const FinancialSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'paid', 'cancelled'],
      default: 'open'
    },
    notes: String
  },
  { timestamps: true }
);

// Exportacao principal
export default mongoose.model('Financial', FinancialSchema);

