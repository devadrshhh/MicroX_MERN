const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true }, // temporary storage for hashed password
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 300 } // 5 minutes TTL
});

module.exports = mongoose.model('Otp', otpSchema);
