/**
 * PostgreSQL Connection Test Script
 * Run this to test your PostgreSQL database connection
 */

const { Pool } = require('pg');

// Load environment variables from .env file
require('dotenv').config();

// PostgreSQL configuration
const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tourjet_db',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
};

async function testConnection() {
  console.log('🧪 Testing PostgreSQL connection...');
  console.log('Configuration:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: '***'
  });

  const pool = new Pool(config);
  
  try {
    // Test basic connection
    console.log('\n1️⃣ Testing basic connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Connection successful!');
    console.log('   Current time:', result.rows[0].current_time);
    console.log('   PostgreSQL version:', result.rows[0].version.split(' ')[0]);
    client.release();

    // Test table existence
    console.log('\n2️⃣ Checking database tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Found tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found. Run setup-postgresql.js first.');
    }

    // Test sample data
    console.log('\n3️⃣ Checking sample data...');
    try {
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Users table: ${usersResult.rows[0].count} records`);
    } catch (error) {
      console.log('⚠️  Users table not found or empty');
    }

    try {
      const vehiclesResult = await pool.query('SELECT COUNT(*) as count FROM vehicles');
      console.log(`✅ Vehicles table: ${vehiclesResult.rows[0].count} records`);
    } catch (error) {
      console.log('⚠️  Vehicles table not found or empty');
    }

    try {
      const routesResult = await pool.query('SELECT COUNT(*) as count FROM routes');
      console.log(`✅ Routes table: ${routesResult.rows[0].count} records`);
    } catch (error) {
      console.log('⚠️  Routes table not found or empty');
    }

    try {
      const policeResult = await pool.query('SELECT COUNT(*) as count FROM police_stations');
      console.log(`✅ Police stations table: ${policeResult.rows[0].count} records`);
    } catch (error) {
      console.log('⚠️  Police stations table not found or empty');
    }

    console.log('\n🎉 PostgreSQL connection test completed successfully!');
    console.log('Your database is ready to use with NeoThink-TourJet.');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your database credentials in .env file');
    console.log('3. Ensure the database exists');
    console.log('4. Run setup-postgresql.js to create tables');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection();
