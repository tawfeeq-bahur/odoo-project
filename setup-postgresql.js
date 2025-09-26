/**
 * PostgreSQL Database Setup Script for NeoThink-TourJet
 * Run this script to set up your PostgreSQL database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

console.log('🚀 Setting up PostgreSQL database for NeoThink-TourJet...');
console.log('Configuration:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  password: '***'
});

async function setupDatabase() {
  const pool = new Pool(config);
  
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful:', result.rows[0].current_time);
    client.release();

    // Create database if it doesn't exist
    console.log('🗄️  Creating database schema...');
    
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        vehicle_id VARCHAR(100) UNIQUE NOT NULL,
        make VARCHAR(100),
        model VARCHAR(100),
        year INTEGER,
        license_plate VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id SERIAL PRIMARY KEY,
        route_id VARCHAR(100) UNIQUE NOT NULL,
        source VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        distance_km DECIMAL(10,2),
        estimated_time_minutes INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        trip_id VARCHAR(100) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id),
        vehicle_id INTEGER REFERENCES vehicles(id),
        route_id INTEGER REFERENCES routes(id),
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        status VARCHAR(50) DEFAULT 'planned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS police_stations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Route Planner Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS route_plans (
        id SERIAL PRIMARY KEY,
        plan_id VARCHAR(100) UNIQUE NOT NULL,
        source VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        source_lat DECIMAL(10, 8),
        source_lng DECIMAL(11, 8),
        dest_lat DECIMAL(10, 8),
        dest_lng DECIMAL(11, 8),
        distance_km DECIMAL(10, 2),
        estimated_time_minutes INTEGER,
        route_polyline JSONB,
        traffic_condition VARCHAR(50),
        weather_condition VARCHAR(50),
        fuel_cost DECIMAL(10, 2),
        toll_cost DECIMAL(10, 2),
        total_cost DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'planned',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Organize Tour Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tour_plans (
        id SERIAL PRIMARY KEY,
        tour_id VARCHAR(100) UNIQUE NOT NULL,
        tour_name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        duration_days INTEGER,
        max_participants INTEGER DEFAULT 50,
        current_participants INTEGER DEFAULT 0,
        price_per_person DECIMAL(10, 2),
        total_budget DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'planning',
        organizer_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tour Destinations Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tour_destinations (
        id SERIAL PRIMARY KEY,
        tour_id INTEGER REFERENCES tour_plans(id) ON DELETE CASCADE,
        destination_name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        visit_date DATE,
        visit_time TIME,
        duration_hours DECIMAL(4, 2),
        cost DECIMAL(10, 2),
        description TEXT,
        order_sequence INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Emergency Contacts Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id SERIAL PRIMARY KEY,
        contact_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        contact_type VARCHAR(50) NOT NULL, -- police, ambulance, fire, hospital, etc.
        service_area VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address TEXT,
        is_24_7 BOOLEAN DEFAULT false,
        priority INTEGER DEFAULT 1, -- 1=highest, 5=lowest
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tour Participants Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tour_participants (
        id SERIAL PRIMARY KEY,
        tour_id INTEGER REFERENCES tour_plans(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_amount DECIMAL(10, 2),
        special_requirements TEXT,
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'registered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_police_stations_location 
      ON police_stations(latitude, longitude)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_trips_user_id 
      ON trips(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id 
      ON trips(vehicle_id)
    `);

    // New table indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_route_plans_source_dest 
      ON route_plans(source, destination)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_route_plans_created_by 
      ON route_plans(created_by)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tour_plans_organizer 
      ON tour_plans(organizer_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tour_plans_dates 
      ON tour_plans(start_date, end_date)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tour_destinations_tour_id 
      ON tour_destinations(tour_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_emergency_contacts_type 
      ON emergency_contacts(contact_type)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_emergency_contacts_location 
      ON emergency_contacts(latitude, longitude)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tour_participants_tour_id 
      ON tour_participants(tour_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tour_participants_user_id 
      ON tour_participants(user_id)
    `);

    console.log('✅ Database schema created successfully!');

    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    // Sample users
    await pool.query(`
      INSERT INTO users (email, name, role) VALUES 
      ('admin@tourjet.com', 'Admin User', 'admin'),
      ('driver1@tourjet.com', 'John Driver', 'employee'),
      ('driver2@tourjet.com', 'Jane Driver', 'employee')
      ON CONFLICT (email) DO NOTHING
    `);

    // Sample vehicles
    await pool.query(`
      INSERT INTO vehicles (vehicle_id, make, model, year, license_plate) VALUES 
      ('VH001', 'Toyota', 'Innova', 2022, 'TN-01-AB-1234'),
      ('VH002', 'Mahindra', 'Bolero', 2021, 'TN-02-CD-5678'),
      ('VH003', 'Tata', 'Safari', 2023, 'TN-03-EF-9012')
      ON CONFLICT (vehicle_id) DO NOTHING
    `);

    // Sample routes
    await pool.query(`
      INSERT INTO routes (route_id, source, destination, distance_km, estimated_time_minutes) VALUES 
      ('RT001', 'Madurai', 'Chennai', 450.5, 480),
      ('RT002', 'Chennai', 'Bangalore', 350.2, 360),
      ('RT003', 'Bangalore', 'Mysore', 150.8, 180)
      ON CONFLICT (route_id) DO NOTHING
    `);

    // Sample route plans
    await pool.query(`
      INSERT INTO route_plans (plan_id, source, destination, source_lat, source_lng, dest_lat, dest_lng, distance_km, estimated_time_minutes, traffic_condition, fuel_cost, toll_cost, total_cost, created_by) VALUES 
      ('RP001', 'Madurai', 'Chennai', 9.9252, 78.1198, 13.0827, 80.2707, 450.5, 480, 'normal', 2500.00, 500.00, 3000.00, 1),
      ('RP002', 'Chennai', 'Bangalore', 13.0827, 80.2707, 12.9716, 77.5946, 350.2, 360, 'light', 1800.00, 300.00, 2100.00, 1),
      ('RP003', 'Bangalore', 'Mysore', 12.9716, 77.5946, 12.2958, 76.6394, 150.8, 180, 'normal', 800.00, 100.00, 900.00, 2)
      ON CONFLICT (plan_id) DO NOTHING
    `);

    // Sample tour plans
    await pool.query(`
      INSERT INTO tour_plans (tour_id, tour_name, description, start_date, end_date, duration_days, max_participants, current_participants, price_per_person, total_budget, organizer_id) VALUES 
      ('TP001', 'Tamil Nadu Heritage Tour', 'Explore the rich heritage of Tamil Nadu including temples, palaces, and cultural sites', '2024-03-15', '2024-03-20', 6, 25, 12, 15000.00, 375000.00, 1),
      ('TP002', 'Kerala Backwaters Experience', 'Relaxing tour through Kerala backwaters with houseboat stays', '2024-04-10', '2024-04-15', 6, 20, 8, 18000.00, 360000.00, 1),
      ('TP003', 'Karnataka Wildlife Safari', 'Wildlife safari and nature exploration in Karnataka', '2024-05-05', '2024-05-10', 6, 15, 5, 20000.00, 300000.00, 2)
      ON CONFLICT (tour_id) DO NOTHING
    `);

    // Sample tour destinations
    await pool.query(`
      INSERT INTO tour_destinations (tour_id, destination_name, latitude, longitude, visit_date, visit_time, duration_hours, cost, description, order_sequence) VALUES 
      (1, 'Meenakshi Temple', 9.9196, 78.1193, '2024-03-15', '09:00:00', 3.00, 500.00, 'Famous temple in Madurai', 1),
      (1, 'Thanjavur Brihadeeswara Temple', 10.7829, 79.1318, '2024-03-16', '10:00:00', 2.50, 300.00, 'UNESCO World Heritage Site', 2),
      (1, 'Mahabalipuram Shore Temple', 12.6168, 80.1944, '2024-03-17', '14:00:00', 2.00, 200.00, 'Ancient temple by the sea', 3),
      (2, 'Alleppey Backwaters', 9.4981, 76.3388, '2024-04-10', '08:00:00', 8.00, 2000.00, 'Houseboat experience', 1),
      (2, 'Kochi Fort', 9.9674, 76.2454, '2024-04-11', '10:00:00', 4.00, 800.00, 'Historic fort and Chinese fishing nets', 2),
      (3, 'Bandipur National Park', 11.6654, 76.4500, '2024-05-05', '06:00:00', 6.00, 1500.00, 'Wildlife safari', 1),
      (3, 'Mysore Palace', 12.3051, 76.6552, '2024-05-06', '10:00:00', 3.00, 500.00, 'Royal palace of Mysore', 2)
      ON CONFLICT DO NOTHING
    `);

    // Sample emergency contacts
    await pool.query(`
      INSERT INTO emergency_contacts (contact_id, name, phone, email, contact_type, service_area, latitude, longitude, address, is_24_7, priority, is_active) VALUES 
      ('EC001', 'Madurai Police Station', '+91-452-2345678', 'madurai.police@tn.gov.in', 'police', 'Madurai', 9.9252, 78.1198, 'Madurai Main Police Station, Tamil Nadu', true, 1, true),
      ('EC002', 'Chennai Police Control Room', '+91-44-23456789', 'chennai.police@tn.gov.in', 'police', 'Chennai', 13.0827, 80.2707, 'Chennai Police Commissionerate, Tamil Nadu', true, 1, true),
      ('EC003', 'Madurai Government Hospital', '+91-452-2345679', 'madurai.hospital@tn.gov.in', 'hospital', 'Madurai', 9.9200, 78.1200, 'Madurai Government Hospital, Tamil Nadu', true, 1, true),
      ('EC004', 'Chennai General Hospital', '+91-44-23456790', 'chennai.hospital@tn.gov.in', 'hospital', 'Chennai', 13.0800, 80.2700, 'Chennai General Hospital, Tamil Nadu', true, 1, true),
      ('EC005', 'Madurai Fire Station', '+91-452-2345680', 'madurai.fire@tn.gov.in', 'fire', 'Madurai', 9.9300, 78.1300, 'Madurai Fire Station, Tamil Nadu', true, 1, true),
      ('EC006', 'Chennai Fire Station', '+91-44-23456791', 'chennai.fire@tn.gov.in', 'fire', 'Chennai', 13.0900, 80.2800, 'Chennai Fire Station, Tamil Nadu', true, 1, true),
      ('EC007', 'National Emergency Number', '100', 'emergency@india.gov.in', 'emergency', 'All India', 0.0000, 0.0000, 'National Emergency Services', true, 1, true),
      ('EC008', 'Ambulance Service', '102', 'ambulance@india.gov.in', 'ambulance', 'All India', 0.0000, 0.0000, 'National Ambulance Service', true, 1, true),
      ('EC009', 'Women Helpline', '181', 'women.helpline@india.gov.in', 'helpline', 'All India', 0.0000, 0.0000, 'National Women Helpline', true, 1, true),
      ('EC010', 'Tourist Helpline', '1363', 'tourist.helpline@india.gov.in', 'helpline', 'All India', 0.0000, 0.0000, 'National Tourist Helpline', true, 2, true)
      ON CONFLICT (contact_id) DO NOTHING
    `);

    console.log('✅ Sample data inserted successfully!');

    // Create .env file if it doesn't exist
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      const envContent = `# PostgreSQL Database Configuration
POSTGRES_HOST=${config.host}
POSTGRES_PORT=${config.port}
POSTGRES_DB=${config.database}
POSTGRES_USER=${config.user}
POSTGRES_PASSWORD=${config.password}

# MongoDB Configuration (existing)
MONGODB_URI=mongodb://localhost:27017
MONGODB_URI_ADMIN=mongodb://localhost:27017
MONGODB_URI_EMPLOYEE=mongodb://localhost:27017
MONGODB_DB_ADMIN=admin_db
MONGODB_DB_EMPLOYEE=emp_db

# Other environment variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created with PostgreSQL configuration');
    }

    console.log('🎉 PostgreSQL database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with your actual PostgreSQL credentials');
    console.log('2. Restart your Next.js development server');
    console.log('3. Your application is now ready to use PostgreSQL!');

  } catch (error) {
    console.error('❌ Error setting up PostgreSQL database:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is running on your system');
    console.log('2. Check your database credentials');
    console.log('3. Ensure the database exists or create it manually');
    console.log('4. Check if the user has proper permissions');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();
