const mongoose = require("mongoose");

// User Schema Definition
const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    plan: { type: String, default: 'free' },
    resetPasswordCode: String,
    resetPasswordExpire: String,
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

// Export User  models
module.exports = User;
