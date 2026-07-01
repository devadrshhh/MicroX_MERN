const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityNote', required: true },
    reason: { type: String, required: true },
    userEmail: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
