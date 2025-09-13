#!/usr/bin/env node

/**
 * Test script to verify reports page functionality
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

async function testReportsPage() {
  log('\n📊 Testing Reports Page...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/reports`);
    
    if (response.ok) {
      log('✅ Reports page is accessible', 'green');
      log(`Status: ${response.status}`, 'blue');
      return true;
    } else {
      log('❌ Reports page not accessible', 'red');
      log(`Status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Reports page test failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Reports Page Test', 'bright');
  log('===================', 'bright');
  
  // Test reports page
  const pageOk = await testReportsPage();
  
  if (pageOk) {
    log('\n🎉 Reports page is working!', 'green');
    log('The driver performance numbers should now be static instead of running.', 'blue');
    log('You can now:', 'blue');
    log('1. Open http://localhost:9002/reports in your browser', 'blue');
    log('2. Login with admin/123 if needed', 'blue');
    log('3. Check the Driver Performance table - numbers should be static', 'blue');
    log('4. EMP001 should show 0% instead of Infinity%', 'blue');
  } else {
    log('\n⚠️  Issues detected:', 'yellow');
    log('1. Make sure the development server is running (npm run dev)', 'blue');
    log('2. Check if the reports page exists and is accessible', 'blue');
    log('3. Check the console for any error messages', 'blue');
  }
  
  log('\n✨ Test completed!', 'magenta');
}

// Run the test
main().catch(error => {
  log(`\n💥 Test failed with error: ${error.message}`, 'red');
  process.exit(1);
});
