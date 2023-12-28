const mongoose = require("mongoose");

// Desire Schema Definition
const desireSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Define Desire models
const Desire = mongoose.model('Desire', desireSchema);

// Export Desire models
module.exports = Desire;
