const { MongoClient } = require('mongodb');

async function testConnections() {
  const adminUri = 'mongodb://localhost:27017';
  const adminDb = 'admin_db';
  const empDb = 'emp_db';

  try {
    console.log('Testing MongoDB connections...\n');

    // Test Admin DB connection
    console.log('1. Testing Admin DB connection...');
    const adminClient = new MongoClient(adminUri);
    await adminClient.connect();
    const adminDatabase = adminClient.db(adminDb);
    
    // Test admin collection
    const adminCollection = adminDatabase.collection('admins');
    const adminCount = await adminCollection.countDocuments();
    console.log(`   ✓ Admin DB connected successfully`);
    console.log(`   ✓ Admin collection 'admins' has ${adminCount} documents`);
    
    // Test Employee DB connection
    console.log('\n2. Testing Employee DB connection...');
    const empClient = new MongoClient(adminUri);
    await empClient.connect();
    const empDatabase = empClient.db(empDb);
    
    // Test employee collection
    const empCollection = empDatabase.collection('employees');
    const empCount = await empCollection.countDocuments();
    console.log(`   ✓ Employee DB connected successfully`);
    console.log(`   ✓ Employee collection 'employees' has ${empCount} documents`);

    // Test odometer collection
    const odometerCollection = empDatabase.collection('odometer_readings');
    const odometerCount = await odometerCollection.countDocuments();
    console.log(`   ✓ Odometer collection 'odometer_readings' has ${odometerCount} documents`);

    // Test routes collection (admin)
    const routesCollection = adminDatabase.collection('routes');
    const routesCount = await routesCollection.countDocuments();
    console.log(`   ✓ Routes collection 'routes' has ${routesCount} documents`);

    console.log('\n✅ All database connections successful!');
    console.log('\nDatabase structure:');
    console.log(`   📊 admin_db (Admin data)`);
    console.log(`      - admins (${adminCount} docs)`);
    console.log(`      - routes (${routesCount} docs)`);
    console.log(`   📊 emp_db (Employee data)`);
    console.log(`      - employees (${empCount} docs)`);
    console.log(`      - odometer_readings (${odometerCount} docs)`);

    await adminClient.close();
    await empClient.close();

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nMake sure MongoDB is running on localhost:27017');
    console.log('You can start MongoDB with: mongod');
  }
}

testConnections();
