#!/usr/bin/env ts-node

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Type definitions for API responses
interface LoginResponse {
  data: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

async function testOnboarding() {
  console.log('🚀 Testing Onboarding Flow...\n');

  try {
    // Step 1: Sign up a new user
    const testEmail = `test-onboarding-${Date.now()}@example.com`;
    console.log('1️⃣ Signing up user:', testEmail);
    
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      email: testEmail,
      password: 'testpassword123',
      role: 'customer'
    });

    console.log('✅ Signup successful');

    // Step 2: Login to get token
    console.log('2️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'testpassword123'
    });

    const accessToken = (loginResponse.data as any).data.access_token;
    console.log('✅ Login successful, got token');

    // Step 3: Complete onboarding
    console.log('3️⃣ Completing onboarding...');
    const onboardingResponse = await axios.post(`${BASE_URL}/auth/onboarding`, {
      name: 'John Doe',
      contact: '+1234567890',
      profileImage: 'https://example.com/avatar.jpg'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ Onboarding successful!');
    console.log('📊 Response:', JSON.stringify(onboardingResponse.data, null, 2));

    // Step 4: Check if user profile was created
    console.log('4️⃣ Checking user profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ Profile retrieved:', JSON.stringify(profileResponse.data, null, 2));

    console.log('\n🎉 Onboarding test completed successfully!');
    console.log('📝 Check your Supabase Database section - you should now see:');
    console.log('   - UserProfile table with 1 record');
    console.log('   - Customer table with 1 record');

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testOnboarding().catch(console.error); 