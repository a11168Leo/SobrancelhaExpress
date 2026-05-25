import mongoose from 'mongoose'
const { Schema, model, Types } = mongoose

const reviewSchema = new Schema({
  client:       { type: Types.ObjectId, ref: 'User', required: true },
  professional: { type: Types.ObjectId, ref: 'User', required: true },
  appointment:  { type: Types.ObjectId, ref: 'Appointment', required: true },
  rating:       { type: Number, min: 1, max: 5, required: true },
  comment:      { type: String, maxlength: 500, default: '' },
  unit:         { type: String, default: '' },
  visible:      { type: Boolean, default: true },
}, { timestamps: true })

reviewSchema.index({ appointment: 1 }, { unique: true })

export default model('Review', reviewSchema)
