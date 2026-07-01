const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

// Get offer status
router.get('/offer', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'firstPurchaseOffer' });
    if (!setting) {
      return res.json({ isActive: true }); // default to true
    }
    res.json({ isActive: setting.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle offer status (Admin only)
router.put('/offer/toggle', protect, async (req, res) => {
  try {
    let setting = await Settings.findOne({ key: 'firstPurchaseOffer' });
    if (!setting) {
      setting = await Settings.create({ key: 'firstPurchaseOffer', value: false });
    } else {
      setting.value = !setting.value;
      await setting.save();
    }
    res.json({ isActive: setting.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
