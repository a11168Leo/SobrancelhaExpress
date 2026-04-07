/* ======================================== */
/* ARQUIVO: BACKEND/SRC/USERS/USER.MODEL.JS */
/* ======================================== */

// Importacoes
import mongoose from 'mongoose';

// Bloco: UserSchema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'profissional', 'cliente'],
      default: 'cliente'
    },
    avatar: String
    ,
    about: {
      type: String,
      default: ''
    },
    contactName: {
      type: String,
      default: ''
    },
    salonName: {
      type: String,
      default: ''
    },
    specialties: {
      type: [String],
      default: []
    },
    mustChangePassword: {
      type: Boolean,
      default: false
    },
    temporaryPasswordGeneratedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

// Exportacao principal
export default mongoose.model('User', UserSchema);

