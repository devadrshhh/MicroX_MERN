const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    orderId: { type: String }, // Custom Order ID: SUBJECT_564387
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    userEmail: { type: String, required: true },
    subject: { type: String },
    stream: { type: String },
    isGift: { type: Boolean, default: false },
    isPromo: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
