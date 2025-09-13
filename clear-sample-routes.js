#!/usr/bin/env node

/**
 * Script to clear sample routes from the database
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

async function getCurrentRoutes() {
  log('\n🔍 Getting current routes from database...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/routes/list`);
    const data = await response.json();
    
    if (data.success) {
      log(`📊 Found ${data.count} routes in database:`, 'blue');
      data.data.forEach((route, index) => {
        log(`  ${index + 1}. ${route.source} → ${route.destination}`, 'yellow');
        log(`     Date: ${new Date(route.date).toLocaleDateString()}`, 'yellow');
        log(`     Vehicle: ${route.vehicleType}`, 'yellow');
      });
      return data.data;
    } else {
      log('❌ Failed to fetch routes', 'red');
      return [];
    }
  } catch (error) {
    log('❌ Error fetching routes:', 'red');
    log(error.message, 'red');
    return [];
  }
}

async function clearAllRoutes() {
  log('\n🗑️  Clearing all routes from database...', 'cyan');
  
  try {
    // Since we don't have a delete endpoint, we'll need to clear the collection
    // For now, let's just show what routes exist and let the user know
    log('⚠️  Note: To clear routes, you can:', 'yellow');
    log('1. Use MongoDB Compass to delete the routes collection', 'blue');
    log('2. Or manually delete specific routes from the database', 'blue');
    log('3. Or use the MongoDB shell to clear the collection', 'blue');
    
    return true;
  } catch (error) {
    log('❌ Error clearing routes:', 'red');
    log(error.message, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Clear Sample Routes Script', 'bright');
  log('=============================', 'bright');
  
  // Get current routes
  const currentRoutes = await getCurrentRoutes();
  
  if (currentRoutes.length === 0) {
    log('\n✅ No routes found in database', 'green');
    log('The routes page will show "No routes found" message.', 'blue');
  } else {
    log(`\n📋 Current routes in database:`, 'bright');
    currentRoutes.forEach((route, index) => {
      log(`${index + 1}. ${route.source} → ${route.destination}`, 'yellow');
    });
    
    log('\n💡 To show only admin-assigned routes:', 'cyan');
    log('1. Delete the sample routes from your MongoDB database', 'blue');
    log('2. Only add routes through the admin interface', 'blue');
    log('3. The routes page will then show only real admin assignments', 'blue');
  }
  
  log('\n✨ Script completed!', 'magenta');
}

// Run the script
main().catch(error => {
  log(`\n💥 Script failed with error: ${error.message}`, 'red');
  process.exit(1);
});
