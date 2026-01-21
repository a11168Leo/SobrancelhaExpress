const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true
    },
    name: { type: String, required: true },
    category: String,
    subcategory: String,
    subcategory2: String,
    price: { type: Number, required: true },
    duration: { type: Number, required: true } // minutos
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
