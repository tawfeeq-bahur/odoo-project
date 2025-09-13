// Test script to verify routes and admin functionality
const BASE_URL = 'http://localhost:9002';

async function testAdminCreation() {
  console.log('🔧 Testing admin creation...');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/create-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    console.log('✅ Admin creation result:', data);
  } catch (error) {
    console.error('❌ Admin creation failed:', error.message);
  }
}

async function testLastRoute() {
  console.log('🔧 Testing last route retrieval...');
  try {
    const response = await fetch(`${BASE_URL}/api/routes/last`);
    const data = await response.json();
    console.log('✅ Last route result:', data);
  } catch (error) {
    console.error('❌ Last route retrieval failed:', error.message);
  }
}

async function testAdminSeed() {
  console.log('🔧 Testing admin seed...');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123' })
    });
    const data = await response.json();
    console.log('✅ Admin seed result:', data);
  } catch (error) {
    console.error('❌ Admin seed failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Fleet Management API Tests\n');
  
  await testAdminCreation();
  console.log('');
  
  await testAdminSeed();
  console.log('');
  
  await testLastRoute();
  console.log('');
  
  console.log('✨ Tests completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAdminCreation, testLastRoute, testAdminSeed };
