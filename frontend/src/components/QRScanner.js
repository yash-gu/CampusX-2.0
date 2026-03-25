import React, { useState, useCallback } from 'react';
import { validateQRCode } from '../utils/qrService';

const QRScanner = ({ onScanSuccess, onScanError, purpose = 'student-id' }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const startScanning = () => {
    setScanning(true);
    setError('');
    setSuccess('');
    
    // Simulate QR scanning (in real app, would use camera)
    setTimeout(() => {
      simulateScan();
    }, 2000);
  };

  const simulateScan = () => {
    // Simulate a successful scan
    const mockQRData = {
      studentId: '12345',
      enrollmentNo: '2021CS001',
      name: 'John Doe',
      purpose: purpose,
      timestamp: Date.now(),
      token: 'mock-token-12345'
    };
    
    handleScanResult(mockQRData);
  };

  const handleScanResult = async (qrData) => {
    try {
      const result = await validateQRCode(qrData);
      
      if (result.valid) {
        setSuccess(`QR Code Valid! Student: ${result.student.name}`);
        onScanSuccess && onScanSuccess(result);
      } else {
        setError(result.message || 'Invalid QR Code');
        onScanError && onScanError(result);
      }
    } catch (err) {
      setError('Failed to validate QR code');
      onScanError && onScanError({ error: err.message });
    } finally {
      setScanning(false);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">QR Code Scanner</h3>
      
      {!scanning ? (
        <div className="text-center">
          <button
            onClick={startScanning}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Start Scanning
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <div className="w-64 h-64 mx-auto border-2 border-blue-600 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="w-32 h-32 bg-blue-100 rounded-lg mx-auto mb-2"></div>
                  <p className="text-blue-600">Scanning...</p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={stopScanning}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cancel Scan
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
    </div>
  );
};

export default QRScanner;
