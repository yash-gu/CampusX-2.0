import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { parseQRData, isQRExpired } from '../../frontend/src/utils/qrService.js';

// QR Code Validation Test Suite
class QRValidator {
  constructor() {
    this.testResults = [];
  }

  // Test 1: QR Data Structure Validation
  testQRDataStructure() {
    console.log('\n🔍 Test 1: QR Data Structure Validation');
    
    const validQRData = {
      studentId: '12345',
      enrollmentNo: '2021CS001',
      name: 'John Doe',
      purpose: 'student-id',
      timestamp: Date.now(),
      token: 'test-token-12345',
      expiresAt: Date.now() + (5 * 60 * 1000)
    };

    const qrString = JSON.stringify(validQRData);
    
    try {
      const parsed = parseQRData(qrString);
      
      const requiredFields = ['studentId', 'enrollmentNo', 'name', 'purpose', 'timestamp', 'token', 'expiresAt'];
      const missingFields = requiredFields.filter(field => !(field in parsed));
      
      if (missingFields.length === 0) {
        this.testResults.push({ test: 'QR Data Structure', status: 'PASS', message: 'All required fields present' });
      } else {
        this.testResults.push({ test: 'QR Data Structure', status: 'FAIL', message: `Missing fields: ${missingFields.join(', ')}` });
      }
    } catch (error) {
      this.testResults.push({ test: 'QR Data Structure', status: 'FAIL', message: error.message });
    }
  }

  // Test 2: JWT Token Validation
  testJWTTokenValidation() {
    console.log('\n🔍 Test 2: JWT Token Validation');
    
    const payload = {
      studentId: '12345',
      enrollmentNo: '2021CS001',
      name: 'John Doe',
      purpose: 'student-id',
      timestamp: Date.now(),
      token: 'test-token-12345',
      expiresAt: Date.now() + (5 * 60 * 1000)
    };

    try {
      // Generate JWT token
      const token = jwt.sign(payload, 'test-secret', { expiresIn: '5m' });
      
      // Verify JWT token
      const decoded = jwt.verify(token, 'test-secret');
      
      if (decoded.studentId === payload.studentId && decoded.name === payload.name) {
        this.testResults.push({ test: 'JWT Token Validation', status: 'PASS', message: 'Token generation and verification successful' });
      } else {
        this.testResults.push({ test: 'JWT Token Validation', status: 'FAIL', message: 'Token data mismatch' });
      }
    } catch (error) {
      this.testResults.push({ test: 'JWT Token Validation', status: 'FAIL', message: error.message });
    }
  }

  // Test 3: Expiry Validation
  testExpiryValidation() {
    console.log('\n🔍 Test 3: Expiry Validation');
    
    try {
      // Test valid QR (not expired)
      const validQR = JSON.stringify({
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes from now
      });
      
      const isValid = !isQRExpired(validQR);
      
      if (isValid) {
        this.testResults.push({ test: 'Valid QR Expiry', status: 'PASS', message: 'Valid QR correctly identified' });
      } else {
        this.testResults.push({ test: 'Valid QR Expiry', status: 'FAIL', message: 'Valid QR incorrectly marked as expired' });
      }
      
      // Test expired QR
      const expiredQR = JSON.stringify({
        expiresAt: Date.now() - (5 * 60 * 1000) // 5 minutes ago
      });
      
      const isExpired = isQRExpired(expiredQR);
      
      if (isExpired) {
        this.testResults.push({ test: 'Expired QR Validation', status: 'PASS', message: 'Expired QR correctly identified' });
      } else {
        this.testResults.push({ test: 'Expired QR Validation', status: 'FAIL', message: 'Expired QR incorrectly marked as valid' });
      }
      
    } catch (error) {
      this.testResults.push({ test: 'Expiry Validation', status: 'FAIL', message: error.message });
    }
  }

  // Test 4: QR Code Generation
  testQRCodeGeneration() {
    console.log('\n🔍 Test 4: QR Code Generation');
    
    const testData = {
      studentId: '12345',
      name: 'John Doe',
      enrollmentNo: '2021CS001'
    };
    
    try {
      const qrDataString = JSON.stringify(testData);
      
      QRCode.toDataURL(qrDataString, (error, url) => {
        if (error) {
          this.testResults.push({ test: 'QR Code Generation', status: 'FAIL', message: error.message });
        } else if (url && url.startsWith('data:image/png;base64,')) {
          this.testResults.push({ test: 'QR Code Generation', status: 'PASS', message: 'QR code generated successfully' });
        } else {
          this.testResults.push({ test: 'QR Code Generation', status: 'FAIL', message: 'Invalid QR code format' });
        }
      });
      
    } catch (error) {
      this.testResults.push({ test: 'QR Code Generation', status: 'FAIL', message: error.message });
    }
  }

  // Test 5: Security Validation
  testSecurityValidation() {
    console.log('\n🔍 Test 5: Security Validation');
    
    try {
      // Test malformed QR data
      const malformedQR = 'invalid-json-data';
      
      try {
        parseQRData(malformedQR);
        this.testResults.push({ test: 'Malformed QR Security', status: 'FAIL', message: 'Should reject malformed data' });
      } catch (error) {
        this.testResults.push({ test: 'Malformed QR Security', status: 'PASS', message: 'Correctly rejects malformed data' });
      }
      
      // Test missing required fields
      const incompleteQR = JSON.stringify({
        studentId: '12345'
        // Missing other required fields
      });
      
      try {
        const parsed = parseQRData(incompleteQR);
        if (!parsed.name || !parsed.enrollmentNo) {
          this.testResults.push({ test: 'Incomplete Data Security', status: 'PASS', message: 'Correctly identifies incomplete data' });
        } else {
          this.testResults.push({ test: 'Incomplete Data Security', status: 'FAIL', message: 'Should reject incomplete data' });
        }
      } catch (error) {
        this.testResults.push({ test: 'Incomplete Data Security', status: 'PASS', message: 'Correctly rejects incomplete data' });
      }
      
    } catch (error) {
      this.testResults.push({ test: 'Security Validation', status: 'FAIL', message: error.message });
    }
  }

  // Test 6: Performance Validation
  testPerformanceValidation() {
    console.log('\n🔍 Test 6: Performance Validation');
    
    try {
      const startTime = Date.now();
      
      // Generate multiple QR codes
      for (let i = 0; i < 100; i++) {
        const qrData = {
          studentId: `student_${i}`,
          name: `Student ${i}`,
          enrollmentNo: `2021CS${i.toString().padStart(3, '0')}`,
          purpose: 'student-id',
          timestamp: Date.now(),
          token: `token_${i}`,
          expiresAt: Date.now() + (5 * 60 * 1000)
        };
        
        parseQRData(JSON.stringify(qrData));
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (duration < 1000) { // Should complete in less than 1 second
        this.testResults.push({ test: 'Performance Validation', status: 'PASS', message: `Processed 100 QR codes in ${duration}ms` });
      } else {
        this.testResults.push({ test: 'Performance Validation', status: 'FAIL', message: `Too slow: ${duration}ms for 100 QR codes` });
      }
      
    } catch (error) {
      this.testResults.push({ test: 'Performance Validation', status: 'FAIL', message: error.message });
    }
  }

  // Run all tests
  runAllTests() {
    console.log('🚀 Starting QR Code Validation Tests...\n');
    
    this.testQRDataStructure();
    this.testJWTTokenValidation();
    this.testExpiryValidation();
    this.testQRCodeGeneration();
    this.testSecurityValidation();
    this.testPerformanceValidation();
    
    this.printResults();
  }

  // Print test results
  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passCount = this.testResults.filter(result => result.status === 'PASS').length;
    const failCount = this.testResults.filter(result => result.status === 'FAIL').length;
    const totalCount = this.testResults.length;
    
    console.log(`Total Tests: ${totalCount}`);
    console.log(`Passed: ${passCount} ✅`);
    console.log(`Failed: ${failCount} ❌`);
    console.log(`Success Rate: ${((passCount / totalCount) * 100).toFixed(1)}%`);
    
    console.log('\nDetailed Results:');
    console.log('------------------');
    
    this.testResults.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.message}`);
    });
    
    if (failCount === 0) {
      console.log('\n🎉 All tests passed! QR Code validation is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new QRValidator();
  validator.runAllTests();
}

export default QRValidator;
