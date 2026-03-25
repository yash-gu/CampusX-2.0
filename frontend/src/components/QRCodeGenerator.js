import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { generateStudentQR } from '../utils/qrService';

const QRCodeGenerator = ({ user, purpose = 'student-id' }) => {
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    generateQRCode();
  }, [user, purpose]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const data = await generateStudentQR(user.id, purpose);
      setQrData(data);
      setError('');
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshQR = () => {
    generateQRCode();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={refreshQR}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h3 className="text-lg font-semibold mb-4">
        {purpose === 'student-id' ? 'Student ID QR Code' : 'Event QR Code'}
      </h3>
      
      <div className="flex justify-center mb-4">
        <QRCode
          value={qrData}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        <p>This QR code expires in 5 minutes</p>
        <p>For: {user.name} ({user.enrollmentNo})</p>
      </div>
      
      <button
        onClick={refreshQR}
        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        Refresh QR Code
      </button>
    </div>
  );
};

export default QRCodeGenerator;
