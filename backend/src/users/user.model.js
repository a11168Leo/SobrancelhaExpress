
/*
====================
SECAO INTERNA PADRAO
====================
*/

import mongoose from 'mongoose';

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
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);



