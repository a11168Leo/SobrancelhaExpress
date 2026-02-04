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
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
