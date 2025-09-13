#!/usr/bin/env node

/**
 * Test script to verify routes page functionality
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

async function testRoutesPage() {
  log('\n🌐 Testing Routes Page...', 'cyan');
  
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

async function testAllEndpoints() {
  log('\n🔍 Testing all related endpoints...', 'cyan');
  
  const endpoints = [
    { name: 'Database Connection', url: '/api/test-connection' },
    { name: 'Last Route', url: '/api/routes/last' },
    { name: 'Admin Check', url: '/api/admin/seed' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.url}`);
      const data = await response.json();
      
      if (response.ok) {
        log(`✅ ${endpoint.name}: OK`, 'green');
      } else {
        log(`❌ ${endpoint.name}: Failed (${response.status})`, 'red');
        if (data.error) {
          log(`   Error: ${data.error}`, 'yellow');
        }
      }
    } catch (error) {
      log(`❌ ${endpoint.name}: Network error`, 'red');
      log(`   ${error.message}`, 'yellow');
    }
  }
}

async function main() {
  log('🚀 Routes Page Test', 'bright');
  log('==================', 'bright');
  
  // Test routes page
  const pageOk = await testRoutesPage();
  
  // Test all endpoints
  await testAllEndpoints();
  
  if (pageOk) {
    log('\n🎉 Routes page is working!', 'green');
    log('You can now:', 'blue');
    log('1. Open http://localhost:3000/routes in your browser', 'blue');
    log('2. Login with admin/123 if needed', 'blue');
    log('3. View the last assigned route', 'blue');
  } else {
    log('\n⚠️  Issues detected:', 'yellow');
    log('1. Make sure the development server is running (npm run dev)', 'blue');
    log('2. Check if the routes page exists and is accessible', 'blue');
    log('3. Check the console for any error messages', 'blue');
  }
  
  log('\n✨ Test completed!', 'magenta');
}

// Run the test
main().catch(error => {
  log(`\n💥 Test failed with error: ${error.message}`, 'red');
  process.exit(1);
});
