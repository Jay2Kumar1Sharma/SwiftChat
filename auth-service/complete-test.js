// Complete auth service test
const http = require('http');

// Set environment to development for testing
process.env.NODE_ENV = 'development';

console.log('🔧 Starting Auth Service Test...\n');

// Import the auth service (this will start the server)
try {
  const app = require('./dist/index.js');
  console.log('✅ Auth service loaded successfully\n');
} catch (error) {
  console.error('❌ Failed to load auth service:', error);
  process.exit(1);
}

// Function to make HTTP requests
function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 4002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsedResponse = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsedResponse });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Run tests after a short delay to ensure server is ready
setTimeout(async () => {
  console.log('🧪 Running Authentication Tests...\n');

  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const healthResponse = await makeRequest('GET', '/health');
    console.log(`Status: ${healthResponse.status}`);
    console.log('Response:', healthResponse.data);
    console.log('');

    // Test 2: Valid Login - Demo User
    console.log('Test 2: Valid Login (demo@example.com)');
    const validLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'demo@example.com',
      password: 'demo123'
    });
    console.log(`Status: ${validLoginResponse.status}`);
    console.log('Response:', validLoginResponse.data);
    console.log('');

    // Test 3: Invalid Email
    console.log('Test 3: Invalid Email');
    const invalidEmailResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'nonexistent@example.com',
      password: 'demo123'
    });
    console.log(`Status: ${invalidEmailResponse.status}`);
    console.log('Response:', invalidEmailResponse.data);
    console.log('');

    // Test 4: Wrong Password
    console.log('Test 4: Wrong Password');
    const wrongPasswordResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'demo@example.com',
      password: 'wrongpassword'
    });
    console.log(`Status: ${wrongPasswordResponse.status}`);
    console.log('Response:', wrongPasswordResponse.data);
    console.log('');

    // Test 5: Test another demo user
    console.log('Test 5: Another Demo User (test@example.com)');
    const anotherUserResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'test123'
    });
    console.log(`Status: ${anotherUserResponse.status}`);
    console.log('Response:', anotherUserResponse.data);
    console.log('');

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  // Exit after tests
  process.exit(0);
}, 3000); // Wait 3 seconds for server to start
