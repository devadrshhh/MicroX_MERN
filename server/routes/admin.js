const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select('email');
    const adminEmails = admins.map(a => a.email);

    // Use aggregation to find users and their associated orderIds
    const users = await User.aggregate([
      { $match: { email: { $nin: adminEmails } } },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'userId',
          as: 'payments'
        }
      },
      {
        $addFields: {
          orderIds: '$payments.orderId'
        }
      },
      {
        $project: {
          password: 0,
          payments: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(users);
  } catch (error) {
    console.error('Error in /admin/users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Toggle block user
router.put('/users/:id/block', verifyAdmin, async (req, res) => {
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
