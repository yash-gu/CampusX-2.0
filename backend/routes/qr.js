import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Generate QR Code
router.post('/generate', auth, [
  body('purpose').isIn(['student-id', 'event-checkin', 'library-access']).withMessage('Valid purpose required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { purpose } = req.body;
    const user = req.user;

    // Create QR data
    const qrData = {
      studentId: user.id,
      enrollmentNo: user.enrollmentNo,
      name: user.name,
      purpose: purpose,
      timestamp: Date.now(),
      token: generateSecureToken(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes expiry
    };

    // Sign the QR data
    const signedQRData = jwt.sign(qrData, process.env.JWT_SECRET, { expiresIn: '5m' });

    res.json({
      success: true,
      qrData: signedQRData,
      expiresAt: qrData.expiresAt
    });

  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate QR Code
router.post('/validate', [
  body('qrData').notEmpty().withMessage('QR data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { qrData } = req.body;

    // Verify and decode QR data
    let decodedData;
    try {
      decodedData = jwt.verify(qrData, process.env.JWT_SECRET);
    } catch (error) {
      return res.json({
        valid: false,
        message: 'Invalid or expired QR code'
      });
    }

    // Check expiry
    if (Date.now() > decodedData.expiresAt) {
      return res.json({
        valid: false,
        message: 'QR code has expired'
      });
    }

    // Get student details
    const student = await User.findById(decodedData.studentId).select('-password');
    if (!student) {
      return res.json({
        valid: false,
        message: 'Student not found'
      });
    }

    // Log QR usage (for audit trail)
    console.log(`QR Validated: ${student.name} (${student.enrollmentNo}) - Purpose: ${decodedData.purpose}`);

    res.json({
      valid: true,
      student: {
        id: student.id,
        name: student.name,
        enrollmentNo: student.enrollmentNo,
        branch: student.branch,
        year: student.year
      },
      purpose: decodedData.purpose,
      timestamp: decodedData.timestamp
    });

  } catch (error) {
    console.error('QR Validation Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get QR Usage History (for admin)
router.get('/history', auth, async (req, res) => {
  try {
    // This would typically query a QR usage log collection
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'QR usage history feature coming soon',
      data: []
    });
  } catch (error) {
    console.error('QR History Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate secure token
const generateSecureToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

export default router;
