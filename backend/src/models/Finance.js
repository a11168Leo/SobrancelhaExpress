const mongoose = require("mongoose");

const FinanceSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true
    },
    amount: Number,
    date: Date,
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Finance", FinanceSchema);
