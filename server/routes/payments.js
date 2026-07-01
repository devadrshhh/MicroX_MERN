const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Material = require('../models/Material');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get Public Key
router.get('/key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Create Order
router.post('/create-order', async (req, res) => {
    try {
        const { materialId, email, userId } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Check Blocklist and User status
        const Blocklist = require('../models/Blocklist');
        const User = require('../models/User');
        
        const isBlockedInList = await Blocklist.findOne({ email: normalizedEmail });
        const existingUser = await User.findOne({ email: normalizedEmail });
        const isUserBlocked = existingUser && existingUser.isBlocked;

        if (isBlockedInList || isUserBlocked) {
            return res.status(403).json({ message: 'YOU ARE BANNED BY MICROX' });
        }

        const material = await Material.findById(materialId);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        let finalAmount = material.amount;
        let isPromo = false;

        // Fetch global settings
        const Settings = require('../models/Settings');
        const offerSetting = await Settings.findOne({ key: 'firstPurchaseOffer' });
        const isOfferActive = offerSetting ? offerSetting.value : true;

        // Apply first order discount for registered users
        if (userId && isOfferActive) {
            const previousOrders = await Payment.countDocuments({ 
                userId, 
                status: 'Completed',
                isGift: { $ne: true }
            });
            if (previousOrders === 0) {
                // Only mark as promo if the original price was actually higher than 1
                if (material.amount > 1) {
                    finalAmount = 1;
                    isPromo = true;
                }
            }
        }

        const options = {
            amount: Math.round(finalAmount * 100), // Ensure integer in paise
            currency: 'INR',
            receipt: `rcpt_${material._id.toString().slice(-10)}`,
        };

        const order = await razorpay.orders.create(options);

        // Track pending payment
        await Payment.create({
            materialId: material._id,
            userId: userId || null,
            razorpayOrderId: order.id,
            amount: finalAmount,
            userEmail: email,
            subject: material.subject,
            stream: material.stream,
            isPromo: isPromo
        });

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify Payment
router.post('/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (payment) {
            payment.status = 'Completed';
            payment.razorpayPaymentId = razorpay_payment_id;
            
            // Generate Custom Order ID: SUBJECT_6digit (only if not already set)
            if (!payment.orderId) {
                const random6Digit = Math.floor(100000 + Math.random() * 900000);
                const subjectPrefix = (payment.subject || 'MATERIAL').trim().replace(/\s+/g, '_').toUpperCase();
                payment.orderId = `${subjectPrefix}_${random6Digit}`;
            }
            
            await payment.save();

            // Update user association if missing
            if (!payment.userId) {
                const user = await User.findOne({ email: payment.userEmail.toLowerCase().trim() });
                if (user) {
                    payment.userId = user._id;
                }
            }

            // Increment download count
            await Material.findByIdAndUpdate(payment.materialId, { $inc: { downloadCount: 1 } });

            res.json({ status: 'success', message: 'Payment verified' });
        } else {
            res.status(404).json({ status: 'failed', message: 'Payment record not found' });
        }
    } else {
        res.status(400).json({ status: 'failed', message: 'Invalid signature' });
    }
});

// Get My Orders (Purchased Materials)
const { userProtect } = require('../middleware/auth');
router.get('/my-orders', userProtect, async (req, res) => {
    try {
        const payments = await Payment.find({ 
            $or: [
                { userId: req.user._id },
                { userEmail: req.user.email.toLowerCase().trim() }
            ],
            status: 'Completed' 
        }).populate('materialId').sort({ createdAt: -1 });
        
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check if material is purchased
router.get('/check-purchase/:materialId', userProtect, async (req, res) => {
  try {
    const purchased = await Payment.findOne({ 
      userId: req.user._id, 
      materialId: req.params.materialId, 
      status: 'Completed' 
    });
    res.json({ purchased: !!purchased });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all transactions (Exclude Gifts)
router.get('/all', protect, async (req, res) => {
    const payments = await Payment.find({ isGift: { $ne: true } }).sort({ createdAt: -1 });
    res.json(payments);
});

// Admin: Get all gifts
router.get('/gifts', protect, async (req, res) => {
    const gifts = await Payment.find({ isGift: true }).sort({ createdAt: -1 });
    res.json(gifts);
});

// Admin: Stats
router.get('/stats', protect, async (req, res) => {
    const totalPayments = await Payment.countDocuments({ status: 'Completed' });
    const totalRevenue = await Payment.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const materialWiseRevenue = await Payment.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: '$subject', total: { $sum: '$amount' } } }
    ]);

    res.json({
        totalPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        materialWiseRevenue
    });
});

module.exports = router;
