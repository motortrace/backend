const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'your_test_token_here'; // Replace with actual test token

const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testCustomerEndpoints() {
  console.log('🧪 Testing Customer Endpoints...\n');

  try {
    // Test 1: Get all customers
    console.log('1️⃣ Testing GET /customers');
    try {
      const response = await axios.get(`${BASE_URL}/customers`, { headers });
      console.log(' GET /customers - Success');
      console.log(`   Found ${response.data.data?.length || 0} customers`);
    } catch (error) {
      console.log('❌ GET /customers - Failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Get customers with search
    console.log('\n2️⃣ Testing GET /customers?search=test');
    try {
      const response = await axios.get(`${BASE_URL}/customers?search=test`, { headers });
      console.log(' GET /customers?search=test - Success');
      console.log(`   Found ${response.data.data?.length || 0} customers matching "test"`);
    } catch (error) {
      console.log('❌ GET /customers?search=test - Failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Get customers with pagination
    console.log('\n3️⃣ Testing GET /customers?limit=5&offset=0');
    try {
      const response = await axios.get(`${BASE_URL}/customers?limit=5&offset=0`, { headers });
      console.log(' GET /customers?limit=5&offset=0 - Success');
      console.log(`   Pagination: ${response.data.pagination?.count || 0} results`);
    } catch (error) {
      console.log('❌ GET /customers?limit=5&offset=0 - Failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Create a test customer
    console.log('\n4️⃣ Testing POST /customers');
    try {
      const testCustomer = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890'
      };
      const response = await axios.post(`${BASE_URL}/customers`, testCustomer, { headers });
      console.log(' POST /customers - Success');
      console.log(`   Created customer: ${response.data.data?.name}`);
      
      const customerId = response.data.data?.id;
      
      // Test 5: Get customer by ID
      console.log('\n5️⃣ Testing GET /customers/:id');
      try {
        const getResponse = await axios.get(`${BASE_URL}/customers/${customerId}`, { headers });
        console.log(' GET /customers/:id - Success');
        console.log(`   Retrieved customer: ${getResponse.data.data?.name}`);
      } catch (error) {
        console.log('❌ GET /customers/:id - Failed:', error.response?.data?.message || error.message);
      }

      // Test 6: Update customer
      console.log('\n6️⃣ Testing PUT /customers/:id');
      try {
        const updateData = { name: 'Updated Test Customer' };
        const updateResponse = await axios.put(`${BASE_URL}/customers/${customerId}`, updateData, { headers });
        console.log(' PUT /customers/:id - Success');
        console.log(`   Updated customer: ${updateResponse.data.data?.name}`);
      } catch (error) {
        console.log('❌ PUT /customers/:id - Failed:', error.response?.data?.message || error.message);
      }

      // Test 7: Get customer vehicles
      console.log('\n7️⃣ Testing GET /customers/:id/vehicles');
      try {
        const vehiclesResponse = await axios.get(`${BASE_URL}/customers/${customerId}/vehicles`, { headers });
        console.log(' GET /customers/:id/vehicles - Success');
        console.log(`   Found ${vehiclesResponse.data.data?.length || 0} vehicles`);
      } catch (error) {
        console.log('❌ GET /customers/:id/vehicles - Failed:', error.response?.data?.message || error.message);
      }

      // Test 8: Get customer work orders
      console.log('\n8️⃣ Testing GET /customers/:id/work-orders');
      try {
        const workOrdersResponse = await axios.get(`${BASE_URL}/customers/${customerId}/work-orders`, { headers });
        console.log(' GET /customers/:id/work-orders - Success');
        console.log(`   Found ${workOrdersResponse.data.data?.length || 0} work orders`);
      } catch (error) {
        console.log('❌ GET /customers/:id/work-orders - Failed:', error.response?.data?.message || error.message);
      }

      // Test 9: Get customer appointments
      console.log('\n9️⃣ Testing GET /customers/:id/appointments');
      try {
        const appointmentsResponse = await axios.get(`${BASE_URL}/customers/${customerId}/appointments`, { headers });
        console.log(' GET /customers/:id/appointments - Success');
        console.log(`   Found ${appointmentsResponse.data.data?.length || 0} appointments`);
      } catch (error) {
        console.log('❌ GET /customers/:id/appointments - Failed:', error.response?.data?.message || error.message);
      }

      // Test 10: Delete test customer (cleanup)
      console.log('\n🔟 Testing DELETE /customers/:id (cleanup)');
      try {
        await axios.delete(`${BASE_URL}/customers/${customerId}`, { headers });
        console.log(' DELETE /customers/:id - Success (test customer cleaned up)');
      } catch (error) {
        console.log('❌ DELETE /customers/:id - Failed:', error.response?.data?.message || error.message);
      }

    } catch (error) {
      console.log('❌ POST /customers - Failed:', error.response?.data?.message || error.message);
    }

    // Test 11: Test validation error
    console.log('\n1️⃣1️⃣ Testing validation error (invalid email)');
    try {
      const invalidCustomer = {
        name: 'Invalid Customer',
        email: 'invalid-email',
        phone: 'invalid-phone'
      };
      await axios.post(`${BASE_URL}/customers`, invalidCustomer, { headers });
      console.log('❌ Validation should have failed for invalid email');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(' Validation error caught correctly');
        console.log(`   Error: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Customer endpoint testing completed!');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the tests
testCustomerEndpoints();
