const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true
    },
    name: { type: String, required: true },
    phone: String,
    status: { type: String, enum: ["ativo", "inativo"], default: "ativo" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", ClientSchema);
