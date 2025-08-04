#!/usr/bin/env ts-node

/**
 * Role-Based Access Control Test Script
 * 
 * This script tests different user roles and their access permissions
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Test different user types
const testUsers = [
  {
    email: `customer-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    role: 'customer',
    name: 'Customer'
  },
  {
    email: `technician-${Date.now()}@example.com`, 
    password: 'TestPassword123!',
    role: 'technician',
    name: 'Technician'
  },
  {
    email: `admin-${Date.now()}@example.com`,
    password: 'TestPassword123!', 
    role: 'admin',
    name: 'Admin'
  }
];

async function testUserRole(user: typeof testUsers[0]) {
  console.log(`\n👤 Testing ${user.name} Role...`);
  let authToken = '';

  try {
    // 1. Signup with role
    console.log(`📝 Signing up ${user.name}...`);
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      email: user.email,
      password: user.password,
      role: user.role
    });
    console.log(`✅ ${user.name} signup successful`);

    // 2. Login
    console.log(`🔑 Logging in ${user.name}...`);
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    }) as { data: any };
    
    authToken = loginResponse.data.data.access_token;
    console.log(`✅ ${user.name} login successful`);

    // 3. Check user profile
    console.log(`👤 Getting ${user.name} profile...`);
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }) as { data: any };
    
    console.log(`📋 ${user.name} role: ${profileResponse.data.user.role}`);
    console.log(`📋 ${user.name} email: ${profileResponse.data.user.email}`);

    // 4. Test protected route access
    console.log(`🛡️ Testing protected route access...`);
    const protectedResponse = await axios.get(`${BASE_URL}/protected`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`✅ ${user.name} can access protected routes`);

    // 5. Test admin route access
    console.log(`👑 Testing admin route access...`);
    try {
      const adminResponse = await axios.get(`${BASE_URL}/admin-only`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log(`✅ ${user.name} can access admin routes`);
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log(`❌ ${user.name} correctly denied admin access (expected)`);
      } else {
        console.log(`❌ ${user.name} admin test failed:`, error.response?.data);
      }
    }

    // 6. Test users route access (requires manager+)
    console.log(`👥 Testing users route access...`);
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log(`✅ ${user.name} can access users routes`);
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log(`❌ ${user.name} correctly denied users access (expected)`);
      } else {
        console.log(`❌ ${user.name} users test failed:`, error.response?.data);
      }
    }

    // 7. Logout
    console.log(`🚪 Logging out ${user.name}...`);
    await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`✅ ${user.name} logout successful`);

    return true;
  } catch (error: any) {
    console.log(`❌ ${user.name} test failed:`, error.response?.data || error.message);
    return false;
  }
}

async function runRoleTests() {
  console.log('🚀 Starting Role-Based Access Control Tests...');
  
  const results = await Promise.all(testUsers.map(testUserRole));
  
  console.log('\n📊 Role Test Results:');
  console.log('====================');
  testUsers.forEach((user, index) => {
    console.log(`${results[index] ? '✅' : '❌'} ${user.name}: ${results[index] ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedCount = results.filter(Boolean).length;
  console.log(`\n🎯 Overall: ${passedCount}/${testUsers.length} role tests passed`);
}

// Run the tests
runRoleTests().catch(console.error); 