import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

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

export default router;
