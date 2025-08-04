#!/usr/bin/env ts-node

/**
 * Authentication Test Script
 * 
 * This script tests all authentication endpoints:
 * - POST /auth/signup
 * - POST /auth/login  
 * - GET /auth/me
 * - GET /protected
 * - POST /auth/logout
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

let authToken = '';

// Type definitions for API responses
interface AuthResponse {
  message: string;
  data?: {
    user?: {
      id: string;
      email: string;
      email_confirmed_at?: string;
      created_at?: string;
    };
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  };
}

interface UserResponse {
  message: string;
  user: {
    id: string;
    email?: string;
    role?: string;
    emailConfirmed: boolean;
    createdAt?: string;
    lastSignIn?: string;
  };
  profile: any;
}

interface ProtectedResponse {
  message: string;
  user: {
    id: string;
    email?: string;
    role?: string;
  };
  timestamp: string;
}

async function testSignup() {
  console.log('\n🔐 Testing Signup...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }) as { data: AuthResponse };
    
    console.log('✅ Signup successful:', response.data.message);
    return true;
  } catch (error: any) {
    console.log('❌ Signup failed:', error.response?.data || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔑 Testing Login...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }) as { data: AuthResponse };
    
    console.log('✅ Login successful:', response.data.message);
    
    // Debug: Log the full response to see what we're getting
    console.log('🔍 Login response data:', JSON.stringify(response.data, null, 2));
    
    // Extract token from response
    if (response.data.data?.access_token) {
      authToken = response.data.data.access_token;
      console.log('🔑 Token extracted successfully');
    } else {
      console.log('⚠️  No access token found in response');
      console.log('Available data keys:', Object.keys(response.data.data || {}));
    }
    
    return true;
  } catch (error: any) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetMe() {
  console.log('\n👤 Testing Get Me...');
  if (!authToken) {
    console.log('⚠️  No auth token available, skipping...');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }) as { data: UserResponse };
    
    console.log('✅ Get Me successful:', response.data.message);
    console.log('User data:', JSON.stringify(response.data.user, null, 2));
    return true;
  } catch (error: any) {
    console.log('❌ Get Me failed:', error.response?.data || error.message);
    return false;
  }
}

async function testProtectedRoute() {
  console.log('\n🛡️  Testing Protected Route...');
  if (!authToken) {
    console.log('⚠️  No auth token available, skipping...');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/protected`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }) as { data: ProtectedResponse };
    
    console.log('✅ Protected route successful:', response.data.message);
    console.log('User in protected route:', response.data.user);
    return true;
  } catch (error: any) {
    console.log('❌ Protected route failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAdminRoute() {
  console.log('\n👑 Testing Admin Route...');
  if (!authToken) {
    console.log('⚠️  No auth token available, skipping...');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/admin-only`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }) as { data: ProtectedResponse };
    
    console.log('✅ Admin route successful:', response.data.message);
    return true;
  } catch (error: any) {
    console.log('❌ Admin route failed (expected if not admin):', error.response?.data || error.message);
    return false;
  }
}

async function testLogout() {
  console.log('\n🚪 Testing Logout...');
  if (!authToken) {
    console.log('⚠️  No auth token available, skipping...');
    return false;
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }) as { data: AuthResponse };
    
    console.log('✅ Logout successful:', response.data.message);
    authToken = ''; // Clear the token
    return true;
  } catch (error: any) {
    console.log('❌ Logout failed:', error.response?.data || error.message);
    return false;
  }
}

async function testWithoutToken() {
  console.log('\n🚫 Testing Protected Route Without Token...');
  try {
    await axios.get(`${BASE_URL}/protected`);
    console.log('❌ Should have failed without token');
    return false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected request without token');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Authentication Tests...');
  console.log(`Test email: ${TEST_EMAIL}`);
  
  const results = {
    signup: await testSignup(),
    login: await testLogin(),
    getMe: await testGetMe(),
    protectedRoute: await testProtectedRoute(),
    adminRoute: await testAdminRoute(),
    logout: await testLogout(),
    withoutToken: await testWithoutToken()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All tests passed! Your authentication system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

// Run the tests
runAllTests().catch(console.error); 