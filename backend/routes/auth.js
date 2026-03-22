import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import auth from '../middleware/auth.js';
import { generateResetToken, sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from '../utils/emailService.js';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('enrollmentNo').trim().notEmpty().withMessage('Enrollment number required'),
  body('branch').isIn(['CSE', 'ECE', 'EE', 'ME', 'CE', 'BT', 'Other']).withMessage('Valid branch required'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be 1-4')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, enrollmentNo, branch, year, bio } = req.body;

    if (!email.endsWith('@bennett.edu.in')) {
      return res.status(400).json({ message: 'Only Bennett University email addresses are allowed' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { enrollmentNo }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or enrollment number' });
    }

    const user = new User({
      name,
      email,
      password,
      enrollmentNo,
      branch,
      year,
      bio: bio || ''
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        enrollmentNo: user.enrollmentNo,
        branch: user.branch,
        year: user.year,
        bio: user.bio,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        enrollmentNo: user.enrollmentNo,
        branch: user.branch,
        year: user.year,
        bio: user.bio,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        enrollmentNo: user.enrollmentNo,
        branch: user.branch,
        year: user.year,
        bio: user.bio,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters'),
  body('branch').optional().isIn(['CSE', 'ECE', 'EE', 'ME', 'CE', 'BT', 'Other']).withMessage('Valid branch required'),
  body('year').optional().isInt({ min: 1, max: 4 }).withMessage('Year must be 1-4'),
  body('profilePic').optional().isURL().withMessage('Profile picture must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, bio, branch, year, profilePic } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (branch !== undefined) updateData.branch = branch;
    if (year !== undefined) updateData.year = year;
    if (profilePic !== undefined) updateData.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        enrollmentNo: user.enrollmentNo,
        branch: user.branch,
        year: user.year,
        bio: user.bio,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    
    // Save password reset token
    await PasswordReset.create({
      user: user._id,
      token: resetToken
    });

    // Send reset email
    const emailResult = await sendPasswordResetEmail(user, resetToken);
    
    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      // For development only - remove in production
      devInfo: emailResult.success && process.env.NODE_ENV !== 'production' ? {
        resetLink: emailResult.resetLink
      } : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Find valid reset token
    const resetRecord = await PasswordReset.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).populate('user');

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update user password
    const user = resetRecord.user;
    user.password = password;
    await user.save();

    // Mark token as used
    resetRecord.isUsed = true;
    await resetRecord.save();

    // Send confirmation email
    await sendPasswordResetConfirmationEmail(user);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Reset Token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const resetRecord = await PasswordReset.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
