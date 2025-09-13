#!/usr/bin/env node

/**
 * Test script to verify routes page frontend functionality
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

async function testRoutesPageAccess() {
  log('\n🌐 Testing Routes Page Access...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/routes`);
    
    if (response.ok) {
      log('✅ Routes page is accessible', 'green');
      log(`Status: ${response.status}`, 'blue');
      return true;
    } else {
      log('❌ Routes page not accessible', 'red');
      log(`Status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Routes page test failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

async function testRoutesListAPI() {
  log('\n🔍 Testing Routes List API...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/routes/list`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Routes List API working', 'green');
      log(`Found ${data.count} routes`, 'blue');
      return data;
    } else {
      log('❌ Routes List API failed', 'red');
      log(`Error: ${data.error || data.message}`, 'red');
      return null;
    }
  } catch (error) {
    log('❌ Routes List API test failed:', 'red');
    log(error.message, 'red');
    return null;
  }
}

async function testLastRouteAPI() {
  log('\n🔍 Testing Last Route API...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/routes/last`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Last Route API working', 'green');
      log(`Last route: ${data.data.source} → ${data.data.destination}`, 'blue');
      return data;
    } else {
      log('❌ Last Route API failed', 'red');
      log(`Error: ${data.error || data.message}`, 'red');
      return null;
    }
  } catch (error) {
    log('❌ Last Route API test failed:', 'red');
    log(error.message, 'red');
    return null;
  }
}

async function testDatabaseConnection() {
  log('\n🔌 Testing Database Connection...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/test-connection`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Database connection working', 'green');
      return true;
    } else {
      log('❌ Database connection failed', 'red');
      log(`Error: ${data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Database connection test failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Routes Frontend Diagnostic Test', 'bright');
  log('==================================', 'bright');
  
  // Test database connection
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    log('\n❌ Cannot proceed without database connection', 'red');
    return;
  }
  
  // Test routes list API
  const routesData = await testRoutesListAPI();
  if (!routesData) {
    log('\n❌ Routes List API not working', 'red');
    return;
  }
  
  // Test last route API
  const lastRouteData = await testLastRouteAPI();
  if (!lastRouteData) {
    log('\n❌ Last Route API not working', 'red');
    return;
  }
  
  // Test routes page access
  const pageOk = await testRoutesPageAccess();
  if (!pageOk) {
    log('\n❌ Routes page not accessible', 'red');
    return;
  }
  
  log('\n🎉 All tests passed!', 'green');
  log('The routes system should be working correctly.', 'blue');
  log('\n📋 Next steps:', 'bright');
  log('1. Open http://localhost:9002/routes in your browser', 'blue');
  log('2. Login with username: admin, password: 123', 'blue');
  log('3. You should see all your routes displayed', 'blue');
  log('4. If you still don\'t see routes, check browser console for errors', 'yellow');
  
  log('\n🔍 Debugging tips:', 'bright');
  log('- Check browser developer tools (F12) for console errors', 'yellow');
  log('- Make sure you\'re logged in as admin', 'yellow');
  log('- Try refreshing the page', 'yellow');
  log('- Check if there are any network errors in the Network tab', 'yellow');
}

// Run the test
main().catch(error => {
  log(`\n💥 Test failed with error: ${error.message}`, 'red');
  process.exit(1);
});
