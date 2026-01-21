const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    title: String, 
    start: Date,
    end: Date,
    status: {
      type: String,
      enum: ["agendado", "concluido", "cancelado"],
      default: "agendado"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
