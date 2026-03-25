import api from './api';

// Generate QR Code Data
export const generateStudentQR = async (studentId, purpose = 'student-id') => {
  try {
    const response = await api.post('/api/qr/generate', {
      studentId,
      purpose,
      timestamp: Date.now()
    });
    
    return response.data.qrData;
  } catch (error) {
    console.error('QR Generation Error:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Validate QR Code
export const validateQRCode = async (qrData) => {
  try {
    const response = await api.post('/api/qr/validate', {
      qrData
    });
    
    return response.data;
  } catch (error) {
    console.error('QR Validation Error:', error);
    throw new Error('Failed to validate QR code');
  }
};

// Create QR data structure
export const createQRData = (student, purpose) => {
  const qrData = {
    studentId: student.id,
    enrollmentNo: student.enrollmentNo,
    name: student.name,
    purpose: purpose,
    timestamp: Date.now(),
    token: generateToken(),
    expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes expiry
  };
  
  return JSON.stringify(qrData);
};

// Generate secure token
const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Check if QR code is expired
export const isQRExpired = (qrData) => {
  try {
    const data = JSON.parse(qrData);
    return Date.now() > data.expiresAt;
  } catch (error) {
    return true; // Invalid format = expired
  }
};

// Parse QR data
export const parseQRData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    throw new Error('Invalid QR code format');
  }
};
