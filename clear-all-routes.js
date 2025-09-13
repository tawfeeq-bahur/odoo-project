#!/usr/bin/env node

/**
 * Script to clear all routes from the database
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

async function clearAllRoutes() {
  log('\n🗑️  Clearing all routes from database...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/routes/delete-all`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log(`✅ Successfully deleted ${data.deletedCount} routes`, 'green');
      return true;
    } else {
      log('❌ Failed to delete routes', 'red');
      log(`Error: ${data.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Network error while deleting routes:', 'red');
    log(error.message, 'red');
    return false;
  }
}

async function verifyRoutesCleared() {
  log('\n🔍 Verifying routes have been cleared...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/routes/list`);
    const data = await response.json();
    
    if (data.success) {
      if (data.count === 0) {
        log('✅ All routes have been successfully cleared', 'green');
        log('The routes page will now show "No routes found" message', 'blue');
        return true;
      } else {
        log(`⚠️  Still found ${data.count} routes in database`, 'yellow');
        return false;
      }
    } else {
      log('❌ Failed to verify routes were cleared', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Error verifying routes:', 'red');
    log(error.message, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Clear All Routes Script', 'bright');
  log('==========================', 'bright');
  
  // Clear all routes
  const cleared = await clearAllRoutes();
  
  if (cleared) {
    // Verify routes were cleared
    const verified = await verifyRoutesCleared();
    
    if (verified) {
      log('\n🎉 All routes cleared successfully!', 'green');
      log('Now only admin-assigned routes will be displayed.', 'blue');
      log('To add routes, use the admin interface to assign them.', 'blue');
    } else {
      log('\n⚠️  Routes may not have been completely cleared', 'yellow');
    }
  } else {
    log('\n❌ Failed to clear routes', 'red');
  }
  
  log('\n✨ Script completed!', 'magenta');
}

// Run the script
main().catch(error => {
  log(`\n💥 Script failed with error: ${error.message}`, 'red');
  process.exit(1);
});
