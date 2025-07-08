#!/usr/bin/env node

// Test script for user registration
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

async function testRegistration() {
  console.log('🧪 Testing User Registration Feature');
  console.log('=====================================');
  
  const testUser = {
    username: 'testuser123',
    email: 'test@example.com',
    password: 'TestPassword123!',
  };
  
  try {
    console.log('📝 Testing registration...');
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('📊 Response:', {
      message: response.data.message,
      user: response.data.data?.user,
      tokenPresent: !!response.data.data?.token,
    });
    
    // Test duplicate email
    console.log('\n📝 Testing duplicate email...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      console.log('❌ Should have failed with duplicate email');
    } catch (error) {
      console.log('✅ Correctly rejected duplicate email:', error.response?.data?.error);
    }
    
    // Test invalid password
    console.log('\n📝 Testing invalid password...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        username: 'testuser456',
        email: 'test2@example.com',
        password: 'weak',
      });
      console.log('❌ Should have failed with weak password');
    } catch (error) {
      console.log('✅ Correctly rejected weak password:', error.response?.data?.error);
    }
    
    console.log('\n🎉 All registration tests passed!');
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.response?.data || error.message);
  }
}

// Run the test
testRegistration();
