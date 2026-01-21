const mongoose = require("mongoose");

const ProfessionalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    categories: [
      {
        name: String,
        subcategories: [
          {
            name: String,
            subcategories2: [String]
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Professional", ProfessionalSchema);
