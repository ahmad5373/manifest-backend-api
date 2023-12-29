const mongoose = require("mongoose");

// Logs Schema Definition
const manifestLogsSchema = new mongoose.Schema(
  {
    desireId: { type: mongoose.Schema.Types.ObjectId, ref: "Desire", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    streak: { type: Date, required: true },
    lastRunDate: { type: Date }, // Add a field to store the date of the last run
    runCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Define Logs models
const Logs = mongoose.model('Logs', manifestLogsSchema);

// Export Logs models
module.exports = Logs;
