// Simple test to check auth service
process.env.NODE_ENV = 'development';

console.log('Starting auth service test...');

// Import and start the service
const app = require('./dist/index.js');

console.log('Auth service imported successfully');

// Give it some time to start
setTimeout(() => {
  console.log('✅ Auth service test completed');
  process.exit(0);
}, 5000);
