const mongoose = require('mongoose');

const blocklistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  reason: { type: String, default: 'Violated terms' }
}, { timestamps: true });

module.exports = mongoose.model('Blocklist', blocklistSchema);
