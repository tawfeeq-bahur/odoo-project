#!/usr/bin/env node

/**
 * Debug script to test routes API and check database data
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

async function testRoutesAPI() {
  log('\n🔍 Testing Routes API...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/routes/last`);
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.ok ? 'green' : 'red');
    log(`Success: ${data.success}`, data.success ? 'green' : 'red');
    
    if (data.success) {
      log('✅ Routes API working!', 'green');
      log(`Last route: ${data.data.source} → ${data.data.destination}`, 'blue');
      log(`Date: ${data.data.date}`, 'blue');
      log(`Distance: ${data.data.distance} km`, 'blue');
      log(`Emissions: ${data.data.emissions} g`, 'blue');
    } else {
      log('❌ Routes API failed', 'red');
      log(`Message: ${data.message}`, 'yellow');
      if (data.debug) {
        log(`Debug info:`, 'yellow');
        log(`  Total routes: ${data.debug.totalRoutes}`, 'yellow');
        if (data.debug.allRoutes) {
          data.debug.allRoutes.forEach((route, index) => {
            log(`  Route ${index + 1}: ${route.source} → ${route.destination} (${route.date})`, 'yellow');
          });
        }
      }
    }
    
    return data;
  } catch (error) {
    log('❌ Network error:', 'red');
    log(error.message, 'red');
    return null;
  }
}

async function testDatabaseConnection() {
  log('\n🔌 Testing database connection...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/test-connection`);
    const data = await response.json();
    
    if (data.success) {
      log('✅ Database connection successful', 'green');
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
  log('🚀 Routes API Debug Test', 'bright');
  log('========================', 'bright');
  
  // Test database connection first
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    log('\n❌ Cannot proceed without database connection', 'red');
    process.exit(1);
  }
  
  // Test routes API
  const routesData = await testRoutesAPI();
  
  if (routesData && routesData.success) {
    log('\n🎉 Everything is working correctly!', 'green');
    log('The routes API is successfully retrieving the last route from the database.', 'blue');
  } else {
    log('\n⚠️  Issues detected:', 'yellow');
    log('1. Check if the development server is running (npm run dev)', 'blue');
    log('2. Check if MongoDB is running and accessible', 'blue');
    log('3. Check the console logs for detailed error information', 'blue');
  }
  
  log('\n✨ Debug test completed!', 'magenta');
}

// Run the test
main().catch(error => {
  log(`\n💥 Test failed with error: ${error.message}`, 'red');
  process.exit(1);
});
