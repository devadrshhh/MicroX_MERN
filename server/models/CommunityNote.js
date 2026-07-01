const mongoose = require('mongoose');

const communityNoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['Notes', 'Microcopy', 'PPT', 'Assignment'], required: true },
    category: { type: String, enum: ['HSE', 'UG'], required: true },
    stream: { type: String },
    classLevel: { type: String },
    Sem: { type: String },
    subject: { type: String, required: true },
    chapter: { type: String },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true }, // .pdf, .docx, etc.
    isApproved: { type: Boolean, default: false },
    uploadedBy: { type: String, default: 'Community User' },
    likes: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunityNote', communityNoteSchema);
