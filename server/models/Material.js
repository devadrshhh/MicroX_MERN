const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Notes', 'Microcopy'], required: true },
    category: { type: String, enum: ['HSE', 'UG'], required: true },
    
    // HSE specific
    stream: { type: String }, // Science, Commerce, etc. or UG Stream
    classLevel: { type: String }, // Plus One, Plus Two
    
    // UG specific
    semester: { type: String },
    
    subject: { type: String, required: true },
    chapter: { type: String, required: true }, // ALL or 1, 2, 3...
    
    pdfPath: { type: String, required: true },
    downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
