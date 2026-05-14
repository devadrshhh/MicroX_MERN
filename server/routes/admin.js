const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const Payment = require('../models/Payment'); // Explicitly import Payment model
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// Middleware to verify admin token (deprecated local version, using global instead)

// Get all users
router.get('/users', protect, async (req, res) => {
  try {
    const admins = await Admin.find().select('email');
    const adminEmails = admins.map(a => a.email);

    // Find all users who are not admins
    const users = await User.find({ email: { $nin: adminEmails } }).sort({ createdAt: -1 }).lean();

    // Fetch order IDs for each user manually to avoid aggregation issues
    const usersWithOrders = await Promise.all(users.map(async (user) => {
      const userPayments = await Payment.find({ userId: user._id, status: 'Completed' }).select('orderId');
      return {
        ...user,
        orderIds: userPayments.map(p => p.orderId).filter(Boolean)
      };
    }));

    res.json(usersWithOrders);
  } catch (error) {
    console.error('Error in /admin/users:', error);
    res.status(500).json({ message: 'Internal server error while fetching users' });
  }
});

// Toggle block user
router.put('/users/:id/block', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: user.isBlocked ? 'User blocked' : 'User unblocked', isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
