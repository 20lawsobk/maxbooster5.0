#!/usr/bin/env tsx
import axios from 'axios';

// Test Marketplace System
// This script tests the P2P marketplace with Stripe Connect instant payouts

const API_BASE = 'http://localhost:5000/api';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestUser123!@#';

async function testMarketplace() {
  console.log('🛒 Testing Marketplace System...\n');

  try {
    // Step 1: Login as test user (buyer)
    console.log('Step 1: Logging in as buyer...');
    const buyerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'test.monthly@maxbooster.com',
      password: process.env.TEST_USER_PASSWORD || 'TestUser123!@#',
    });

    const buyerCookie = buyerLoginRes.headers['set-cookie']?.[0];
    if (!buyerCookie) throw new Error('Failed to get buyer session cookie');

    console.log('✅ Buyer logged in successfully\n');

    // Step 2: Browse marketplace listings
    console.log('Step 2: Browsing marketplace listings...');
    const listingsRes = await axios.get(`${API_BASE}/marketplace/listings?category=beats`, {
      headers: { Cookie: buyerCookie },
    });
    console.log('✅ Marketplace Listings:', listingsRes.data);

    // Step 3: Login as seller
    console.log('\nStep 3: Logging in as seller...');
    const sellerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'test.yearly@maxbooster.com',
      password: process.env.TEST_USER_PASSWORD || 'TestUser123!@#',
    });

    const sellerCookie = sellerLoginRes.headers['set-cookie']?.[0];
    if (!sellerCookie) throw new Error('Failed to get seller session cookie');

    console.log('✅ Seller logged in successfully\n');

    // Step 4: Create a marketplace listing
    console.log('Step 4: Creating marketplace listing...');
    const createListingRes = await axios.post(
      `${API_BASE}/marketplace/listings`,
      {
        title: 'Professional EDM Beat - Max Booster Test',
        description: 'High-quality electronic dance music beat, perfect for club tracks',
        genre: 'EDM',
        bpm: 128,
        key: 'A minor',
        price: 29.99,
        audioUrl: '/uploads/preview.mp3',
        artworkUrl: '/uploads/artwork.jpg',
        tags: ['edm', 'electronic', 'dance', 'club'],
        licenses: [
          {
            type: 'basic',
            price: 29.99,
            features: ['MP3 Download', 'Non-Exclusive Rights'],
          },
          {
            type: 'premium',
            price: 99.99,
            features: ['WAV Download', 'Trackouts', 'Exclusive Rights'],
          },
        ],
      },
      { headers: { Cookie: sellerCookie } }
    );
    console.log('✅ Listing Created:', createListingRes.data);

    // Step 5: Get seller's listings
    console.log("\nStep 5: Fetching seller's listings...");
    const sellerListingsRes = await axios.get(`${API_BASE}/marketplace/my-listings`, {
      headers: { Cookie: sellerCookie },
    });
    console.log('✅ Seller Listings:', sellerListingsRes.data);

    // Step 6: Buyer views listing details
    console.log('\nStep 6: Viewing listing details...');
    const listingDetailsRes = await axios.get(
      `${API_BASE}/marketplace/listings/${createListingRes.data.id}`,
      { headers: { Cookie: buyerCookie } }
    );
    console.log('✅ Listing Details:', listingDetailsRes.data);

    // Step 7: Create order (purchase)
    console.log('\nStep 7: Creating purchase order...');
    const orderRes = await axios.post(
      `${API_BASE}/marketplace/orders`,
      {
        beatId: createListingRes.data.id,
        licenseType: 'basic', // Purchase basic license
      },
      { headers: { Cookie: buyerCookie } }
    );
    console.log('✅ Order Created:', orderRes.data);

    // Step 8: Check buyer's orders
    console.log("\nStep 8: Fetching buyer's orders...");
    const buyerOrdersRes = await axios.get(`${API_BASE}/marketplace/my-orders`, {
      headers: { Cookie: buyerCookie },
    });
    console.log('✅ Buyer Orders:', buyerOrdersRes.data);

    // Step 9: Check seller's sales
    console.log("\nStep 9: Fetching seller's sales...");
    const sellerSalesRes = await axios.get(`${API_BASE}/marketplace/my-sales`, {
      headers: { Cookie: sellerCookie },
    });
    console.log('✅ Seller Sales:', sellerSalesRes.data);

    // Step 10: Test instant payout
    console.log('\nStep 10: Testing instant payout...');
    const payoutRes = await axios.post(
      `${API_BASE}/marketplace/instant-payout`,
      {
        orderId: orderRes.data.id,
      },
      { headers: { Cookie: sellerCookie } }
    );
    console.log('✅ Instant Payout:', payoutRes.data);

    // Step 11: Get marketplace analytics
    console.log('\nStep 11: Fetching marketplace analytics...');
    const analyticsRes = await axios.get(`${API_BASE}/marketplace/analytics`, {
      headers: { Cookie: sellerCookie },
    });
    console.log('✅ Marketplace Analytics:', analyticsRes.data);

    console.log('\n🎉 Marketplace test completed successfully!');
    console.log('P2P marketplace with instant payouts is working correctly.');

    return {
      success: true,
      listing: createListingRes.data,
      order: orderRes.data,
      payout: payoutRes.data,
    };
  } catch (error: any) {
    console.error('\n❌ Marketplace test failed:', error.response?.data || error.message);
    console.error('Details:', error.response?.status, error.response?.statusText);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the test
testMarketplace().then((result) => {
  console.log('\n📊 Test Summary:', result);
  process.exit(result.success ? 0 : 1);
});
