const mongoose = require('mongoose');

const resetOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 300 } // 5 minutes TTL
});

module.exports = mongoose.model('ResetOtp', resetOtpSchema);
