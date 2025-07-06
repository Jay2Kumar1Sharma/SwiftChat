const express = require('express');
const path = require('path');

// Set NODE_ENV to development for testing
process.env.NODE_ENV = 'development';

// Start the auth service
require('./dist/index.js');

// Wait a moment for the service to start, then test login
setTimeout(async () => {
  const fetch = require('node-fetch');
  
  console.log('\n=== Testing Login Functionality ===\n');
  
  try {
    // Test 1: Valid demo user login
    console.log('🧪 Test 1: Valid demo user login');
    const validResponse = await fetch('http://localhost:4002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'demo123'
      })
    });
    
    const validResult = await validResponse.json();
    console.log('✅ Valid login result:', validResult);
    
    // Test 2: Invalid user login (should fail)
    console.log('\n🧪 Test 2: Invalid user login');
    const invalidResponse = await fetch('http://localhost:4002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
    });
    
    const invalidResult = await invalidResponse.json();
    console.log('❌ Invalid login result (expected error):', invalidResult);
    
    // Test 3: Valid user with wrong password
    console.log('\n🧪 Test 3: Valid user with wrong password');
    const wrongPasswordResponse = await fetch('http://localhost:4002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'wrongpassword'
      })
    });
    
    const wrongPasswordResult = await wrongPasswordResponse.json();
    console.log('❌ Wrong password result (expected error):', wrongPasswordResult);
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  // Exit after tests
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}, 2000);
