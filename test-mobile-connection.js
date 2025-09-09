// Test script to verify mobile app connection to backend
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testConnection() {
  console.log('🧪 Testing mobile app connection to backend...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test 2: Auth test endpoint
    console.log('\n2. Testing auth test endpoint...');
    const authTestResponse = await fetch(`${BASE_URL}/auth/test`);
    const authTestData = await authTestResponse.json();
    console.log('✅ Auth test:', authTestData);

    // Test 3: Test signup endpoint (with invalid data to check error handling)
    console.log('\n3. Testing signup endpoint error handling...');
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing email and password to test validation
      }),
    });
    const signupData = await signupResponse.json();
    console.log('✅ Signup validation:', signupData);

    // Test 4: Test with valid signup data (this will fail if Supabase is not configured)
    console.log('\n4. Testing signup with valid data...');
    const validSignupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        role: 'customer'
      }),
    });
    const validSignupData = await validSignupResponse.json();
    console.log('✅ Valid signup response:', validSignupData);

    console.log('\n🎉 All tests completed!');
    console.log('\n📱 Mobile app should be able to connect to:');
    console.log(`   - Signup: ${BASE_URL}/auth/signup`);
    console.log(`   - Login: ${BASE_URL}/auth/login`);
    console.log(`   - Google Auth: ${BASE_URL}/auth/google`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend server is running: npm run dev');
    console.log('2. Check if port 3000 is available');
    console.log('3. Verify environment variables are set (SUPABASE_URL, SUPABASE_ANON_KEY)');
  }
}

testConnection();
