#!/usr/bin/env node

/**
 * Test script to verify routes list API
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:9002';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRoutesListAPI() {
  log('\n🔍 Testing Routes List API...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/routes/list`);
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.ok ? 'green' : 'red');
    log(`Success: ${data.success}`, data.success ? 'green' : 'red');
    
    if (data.success) {
      log('✅ Routes List API working!', 'green');
      log(`Total routes found: ${data.count}`, 'blue');
      
      if (data.data && data.data.length > 0) {
        log('\n📋 Routes in database:', 'cyan');
        data.data.forEach((route, index) => {
          log(`  ${index + 1}. ${route.source} → ${route.destination}`, 'blue');
          log(`     Distance: ${route.distance} km, Emissions: ${route.emissions} g`, 'yellow');
          log(`     Date: ${new Date(route.date).toLocaleDateString()}`, 'yellow');
          log(`     Vehicle: ${route.vehicleType} (${route.vehicleYear || 'N/A'})`, 'yellow');
          log('');
        });
      } else {
        log('ℹ️  No routes found in database', 'yellow');
      }
    } else {
      log('❌ Routes List API failed', 'red');
      log(`Message: ${data.message}`, 'yellow');
      if (data.error) {
        log(`Error: ${data.error}`, 'red');
      }
    }
    
    return data;
  } catch (error) {
    log('❌ Network error:', 'red');
    log(error.message, 'red');
    return null;
  }
}

async function main() {
  log('🚀 Routes List API Test', 'bright');
  log('======================', 'bright');
  
  // Test routes list API
  const routesData = await testRoutesListAPI();
  
  if (routesData && routesData.success) {
    log('\n🎉 Routes List API is working correctly!', 'green');
    log('The routes page should now display all routes from your database.', 'blue');
    log('You can now:', 'blue');
    log('1. Open http://localhost:9002/routes in your browser', 'blue');
    log('2. Login with admin/123 if needed', 'blue');
    log('3. See all your assigned routes displayed properly', 'blue');
  } else {
    log('\n⚠️  Issues detected:', 'yellow');
    log('1. Check if the development server is running (npm run dev)', 'blue');
    log('2. Check if MongoDB is running and accessible', 'blue');
    log('3. Check the console logs for detailed error information', 'blue');
  }
  
  log('\n✨ Test completed!', 'magenta');
}

// Run the test
main().catch(error => {
  log(`\n💥 Test failed with error: ${error.message}`, 'red');
  process.exit(1);
});
