const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const Payment = require('../models/Payment');
const Material = require('../models/Material');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const Blocklist = require('../models/Blocklist');

// Gift Material to User
router.post('/gift', protect, async (req, res) => {
  try {
    const { email, materialId } = req.body;
    
    if (!email || !materialId) {
      return res.status(400).json({ message: 'Email and Material ID are required' });
    }

    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    const user = await User.findOne({ email });
    // Note: We allow gifting to non-registered emails too (guest access)
    
    // Check if already gifted/purchased
    const existing = await Payment.findOne({ userEmail: email, materialId, status: 'Completed' });
    if (existing) return res.status(400).json({ message: 'User already has access to this material' });

    const giftOrder = await Payment.create({
      materialId,
      userId: user?._id || null,
      userEmail: email,
      amount: 0,
      status: 'Completed',
      isGift: true,
      subject: material.subject,
      stream: material.stream,
      orderId: `GIFT_${Date.now().toString().slice(-6)}`,
      razorpayOrderId: `GIFT_SYSTEM_${Date.now()}`
    });

    res.json({ message: 'Material gifted successfully', order: giftOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (Registered + Guest Buyers)
router.get('/users', protect, async (req, res) => {
  try {
    const admins = await Admin.find().select('email');
    const adminEmails = admins.map(a => a.email);

    // 1. Get all registered users (excluding admins)
    const registeredUsers = await User.find({ email: { $nin: adminEmails } }).sort({ createdAt: -1 }).lean();

    // 2. Get all unique emails from successful payments
    const payments = await Payment.find({ status: 'Completed' }).select('userEmail orderId').lean();
    
    // 3. Get all blocked emails
    const blockedEmailsDocs = await Blocklist.find({}).select('email').lean();
    const blockedEmailsSet = new Set(blockedEmailsDocs.map(b => b.email));

    // Group payments by email
    const paymentMap = {};
    payments.forEach(p => {
      if (!paymentMap[p.userEmail]) {
        paymentMap[p.userEmail] = [];
      }
      if (p.orderId) paymentMap[p.userEmail].push(p.orderId);
    });

    // 4. Combine data
    const allEmails = new Set([
      ...registeredUsers.map(u => u.email),
      ...Object.keys(paymentMap)
    ]);

    adminEmails.forEach(email => allEmails.delete(email));

    const combinedList = Array.from(allEmails).map(email => {
      const user = registeredUsers.find(u => u.email === email);
      const orderIds = paymentMap[email] || [];
      const isBlocked = user?.isBlocked || blockedEmailsSet.has(email);
      
      return {
        _id: user?._id || `guest_${email}`,
        name: user?.name || 'Unknown',
        email: email,
        isBlocked: isBlocked,
        createdAt: user?.createdAt || null,
        orderIds: orderIds,
        isRegistered: !!user
      };
    });

    combinedList.sort((a, b) => (b.isRegistered - a.isRegistered) || a.name.localeCompare(b.name));

    res.json(combinedList);
  } catch (error) {
    console.error('Error in /admin/users:', error);
    res.status(500).json({ message: 'Internal server error while fetching users' });
  }
});

// Toggle block user (Supports both registered users and guests)
router.put('/users/:id/block', protect, async (req, res) => {
  try {
    const id = req.params.id;
    let email = '';
    let isCurrentlyBlocked = false;

    if (id.startsWith('guest_')) {
      email = id.replace('guest_', '');
      const blocked = await Blocklist.findOne({ email });
      if (blocked) {
        await Blocklist.deleteOne({ email });
        isCurrentlyBlocked = false;
      } else {
        await Blocklist.create({ email });
        isCurrentlyBlocked = true;
      }
    } else {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      user.isBlocked = !user.isBlocked;
      await user.save();
      
      email = user.email;
      isCurrentlyBlocked = user.isBlocked;

      // Sync with Blocklist for consistency
      if (isCurrentlyBlocked) {
        await Blocklist.updateOne({ email }, { email }, { upsert: true });
      } else {
        await Blocklist.deleteOne({ email });
      }
    }

    res.json({ 
      message: isCurrentlyBlocked ? 'User blocked' : 'User unblocked', 
      isBlocked: isCurrentlyBlocked 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Platform Stats
router.get('/stats', protect, async (req, res) => {
  try {
    const CommunityNote = require('../models/CommunityNote');

    const totalUsers = await User.countDocuments();
    const totalMaterials = await Material.countDocuments();
    const totalFreeNotes = await CommunityNote.countDocuments();
    
    const materials = await Material.find({}, 'downloadCount amount');
    const freeNotes = await CommunityNote.find({}, 'downloadCount');
    
    const materialDownloads = materials.reduce((sum, m) => sum + (m.downloadCount || 0), 0);
    const freeNoteDownloads = freeNotes.reduce((sum, n) => sum + (n.downloadCount || 0), 0);
    
    const successfulPayments = await Payment.find({ status: 'Completed' }, 'amount');
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      totalUsers,
      totalMaterials,
      totalFreeNotes,
      totalDownloads: materialDownloads + freeNoteDownloads,
      materialDownloads,
      freeNoteDownloads,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
