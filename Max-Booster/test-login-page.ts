import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const TEST_USER_EMAIL = 'test.monthly@maxbooster.com';
const TEST_USER_PASSWORD = 'TestUser123!@#';

async function testLoginPage() {
  console.log('🔐 Testing Login Page Functionality...\n');

  try {
    // Test 1: Login with valid credentials
    console.log('Test 1: Login with valid credentials...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

    if (loginRes.status === 200) {
      console.log('✅ Login successful!');
      console.log('   User:', loginRes.data.user?.email);
      console.log('   Subscription:', loginRes.data.user?.subscriptionTier);
    }

    // Test 2: Verify session is created
    console.log('\nTest 2: Verify authenticated session...');
    const sessionCookie = loginRes.headers['set-cookie']?.[0];
    if (!sessionCookie) {
      throw new Error('No session cookie received');
    }

    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Cookie: sessionCookie },
    });

    console.log('✅ Session verified!');
    console.log('   Authenticated as:', meRes.data.email);

    // Test 3: Login with invalid credentials
    console.log('\nTest 3: Login with invalid credentials (should fail)...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        username: TEST_USER_EMAIL,
        password: 'WrongPassword123!',
      });
      console.log('❌ FAIL: Invalid credentials should be rejected');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials properly rejected');
      } else {
        throw error;
      }
    }

    // Test 4: Logout
    console.log('\nTest 4: Testing logout...');
    const logoutRes = await axios.post(`${API_BASE}/auth/logout`, {}, {
      headers: { Cookie: sessionCookie },
    });

    if (logoutRes.status === 200) {
      console.log('✅ Logout successful');
    }

    console.log('\n🎉 All login page tests passed!');
    console.log('Login functionality is working correctly.');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Login test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    process.exit(1);
  }
}

testLoginPage();
