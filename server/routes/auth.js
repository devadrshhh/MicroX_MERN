const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const axios = require('axios');
const Otp = require('../models/Otp');
const ResetOtp = require('../models/ResetOtp');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email: normalizedEmail, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ 
      token, 
      user: { _id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (admin && (await admin.matchPassword(password))) {
      const token = jwt.sign({ id: admin._id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({ 
        token, 
        user: { id: admin._id, email: admin.email, isAdmin: true } 
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'you are banned by microx' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get User Data
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

const { protect } = require('../middleware/auth');

// Get all admins
router.get('/all', protect, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new admin
router.post('/add', protect, async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

    const admin = new Admin({ email, password });
    await admin.save();
    res.status(201).json({ message: 'Admin added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete admin
router.delete('/:id', protect, async (req, res) => {
  try {
    // Prevent deleting the last admin? Or maybe just allow it if they know what they are doing.
    // For safety, let's check count.
    const count = await Admin.countDocuments();
    if (count <= 1) {
      return res.status(400).json({ message: 'Cannot delete the only admin account' });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google Sign-In
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google account' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists with googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // 2. Check if user exists with the same email
      user = await User.findOne({ email: normalizedEmail });

      if (user) {
        // Link the Google account
        user.googleId = googleId;
        if (!user.profilePicture && picture) {
          user.profilePicture = picture;
        }
        await user.save();
      } else {
        // 3. Create a new user
        user = new User({
          name: name || 'Google User',
          email: normalizedEmail,
          googleId,
          profilePicture: picture,
        });
        await user.save();
      }
    } else {
      // User exists with googleId. Update profile picture if it has changed/updated or not set
      if (!user.profilePicture && picture) {
        user.profilePicture = picture;
        await user.save();
      }
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'you are banned by microx' });
    }

    // Create secure JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// Send OTP via Resend
router.post('/send-otp', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Generate secure random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 3. Hash password before temporary storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save/Upsert OTP record in the temporary database (valid for 5 mins)
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { 
        otp, 
        name, 
        password: hashedPassword,
        attempts: 0,
        createdAt: new Date() // Updates TTL expiration start time
      },
      { upsert: true, new: true }
    );

    // 5. Send OTP using Resend API
    try {
      const emailBody = {
        from: 'MicroX <otp@new.microxlearn.online>',
        to: [normalizedEmail],
        subject: 'Verify your MicroX account',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #333333;">
            <h2 style="color: #111111; text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 24px;">Verify your MicroX account</h2>
            <p>Hello ${name},</p>
            <p>Your verification code is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 4px; background: #f4f4f4; padding: 12px 24px; border-radius: 8px; border: 1px solid #ddd; display: inline-block; color: #000000;">${otp}</span>
            </div>
            <p>This code expires in 5 minutes.</p>
            <p>If you didn't request this verification, you can safely ignore this email.</p>
            <p style="color: #666666; font-size: 11px; margin-top: 32px; border-top: 1px solid #eeeeee; padding-top: 12px;">If you didn't request this verification, you can safely ignore this email.</p>
            <p style="color: #111111; font-weight: bold; margin-top: 16px;">— MicroX Team</p>
          </div>
        `
      };

      await axios.post('https://api.resend.com/emails', emailBody, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`OTP email sent to ${normalizedEmail}`);
    } catch (resendError) {
      console.error('Resend Dispatch Error:', resendError.response?.data || resendError.message);
    }

    // In development mode, we return the OTP in the JSON response so the client can display it in the debug panel!
    const responsePayload = { message: 'OTP sent to email' };
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.otp = otp; // Only expose in non-production
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch OTP record
    const otpRecord = await Otp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // 2. Limit verification attempts
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ message: 'Too many incorrect attempts. Please register again.' });
    }

    // 3. Verify OTP
    if (otpRecord.otp !== otp.trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    // 4. Verification successful! Create user account.
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name: otpRecord.name,
      email: normalizedEmail,
      password: otpRecord.password // already hashed
    });

    await user.save();

    // 5. Delete OTP record immediately after verification
    await Otp.deleteOne({ email: normalizedEmail });

    // 6. Create secure JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Forgot Password - Send Reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check whether user exists in the database
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email address.' });
    }

    // 2. Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 3. Save/Upsert Reset OTP record (valid for 5 mins)
    await ResetOtp.findOneAndUpdate(
      { email: normalizedEmail },
      { 
        otp, 
        attempts: 0,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );

    // 4. Send Reset OTP using Resend API
    try {
      const emailBody = {
        from: 'MicroX <otp@new.microxlearn.online>',
        to: [normalizedEmail],
        subject: 'Reset Your MicroX Password',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #333333;">
            <h2 style="color: #111111; text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 24px;">Reset Your MicroX Password</h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password.</p>
            <p>Your verification code is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 4px; background: #f4f4f4; padding: 12px 24px; border-radius: 8px; border: 1px solid #ddd; display: inline-block; color: #000000;">${otp}</span>
            </div>
            <p>This code expires in 5 minutes.</p>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <p style="color: #666666; font-size: 11px; margin-top: 32px; border-top: 1px solid #eeeeee; padding-top: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
            <p style="color: #111111; font-weight: bold; margin-top: 16px;">— MicroX Team</p>
          </div>
        `
      };

      await axios.post('https://api.resend.com/emails', emailBody, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`Reset OTP sent to ${normalizedEmail}`);
    } catch (resendError) {
      console.error('Resend Dispatch Error:', resendError.response?.data || resendError.message);
    }

    // In development mode, return OTP in payload for debugging
    const responsePayload = { message: 'Reset code sent to email' };
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.otp = otp;
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify Reset OTP
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch Reset OTP record
    const otpRecord = await ResetOtp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // 2. Limit verification attempts (max 5)
    if (otpRecord.attempts >= 5) {
      await ResetOtp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new code.' });
    }

    // 3. Verify OTP code
    if (otpRecord.otp !== otp.trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    res.status(200).json({ message: 'OTP Verified' });
  } catch (error) {
    console.error('Verify Reset OTP Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify OTP is still valid (must exist and match)
    const otpRecord = await ResetOtp.findOne({ email: normalizedEmail });
    if (!otpRecord || otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // 3. Find User
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // 4. Hash new password and save
    user.password = password; // pre-save hook in User.js handles hashing!
    await user.save();

    // 5. Invalidate all previous reset tokens (delete the ResetOtp record)
    await ResetOtp.deleteOne({ email: normalizedEmail });

    // 6. Generate secure JWT token and return user details for auto-login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({ 
      message: 'Password updated successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
