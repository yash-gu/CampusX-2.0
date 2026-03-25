import React, { useState } from 'react';
import QRCodeGenerator from '../components/QRCodeGenerator';
import QRScanner from '../components/QRScanner';
import { useAuth } from '../context/AuthContext';

const QRPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('generate');
  const [scanResult, setScanResult] = useState(null);

  const handleScanSuccess = (result) => {
    setScanResult(result);
  };

  const handleScanError = (error) => {
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">
          CampusX QR Services
        </h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'generate'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Generate QR
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'scan'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Scan QR
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {activeTab === 'generate' ? (
              <QRCodeGenerator user={user} purpose="student-id" />
            ) : (
              <QRScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                purpose="student-id"
              />
            )}
          </div>

          <div>
            {/* QR Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">QR Code Information</h3>
              
              {activeTab === 'generate' ? (
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-900">Student ID QR Code</h4>
                    <p className="text-gray-600">
                      Use this QR code for campus access, library entry, and event check-ins.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-900">Security Features</h4>
                    <ul className="text-gray-600 list-disc list-inside">
                      <li>Expires in 5 minutes</li>
                      <li>Encrypted with JWT token</li>
                      <li>Single-use validation</li>
                      <li>Tamper-proof design</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-yellow-900">Usage Instructions</h4>
                    <ol className="text-gray-600 list-decimal list-inside">
                      <li>Generate fresh QR code when needed</li>
                      <li>Show QR code to authorized personnel</li>
                      <li>QR code automatically expires</li>
                      <li>Refresh if expired</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-900">QR Scanner</h4>
                    <p className="text-gray-600">
                      Scan student QR codes for verification and access control.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-900">Validation Process</h4>
                    <ul className="text-gray-600 list-disc list-inside">
                      <li>QR code authenticity check</li>
                      <li>Student identity verification</li>
                      <li>Expiry time validation</li>
                      <li>Tamper detection</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-purple-900">Authorized Use</h4>
                    <p className="text-gray-600">
                      Only authorized personnel should use QR scanner for verification.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Scan Result */}
            {scanResult && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-lg font-semibold mb-4 text-green-900">
                  Scan Result
                </h3>
                <div className="space-y-2">
                  <p><strong>Student:</strong> {scanResult.student.name}</p>
                  <p><strong>Enrollment:</strong> {scanResult.student.enrollmentNo}</p>
                  <p><strong>Branch:</strong> {scanResult.student.branch}</p>
                  <p><strong>Year:</strong> {scanResult.student.year}</p>
                  <p><strong>Purpose:</strong> {scanResult.purpose}</p>
                  <p><strong>Time:</strong> {new Date(scanResult.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRPage;
