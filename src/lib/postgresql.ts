// PostgreSQL Database Connection for NeoThink-TourJet
import { Pool, PoolClient, QueryResult } from 'pg'

// PostgreSQL configuration
const POSTGRES_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tourjet_db',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
}

// Create a connection pool
let pool: Pool | null = null

// Initialize the connection pool
function initializePool(): Pool {
  if (!pool) {
    pool = new Pool(POSTGRES_CONFIG)
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })
    
    console.log('PostgreSQL connection pool initialized')
  }
  return pool
}

// Get a client from the pool
export async function getClient(): Promise<PoolClient> {
  const poolInstance = initializePool()
  return await poolInstance.connect()
}

// Execute a query with automatic client management
export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const client = await getClient()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Execute a transaction
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time')
    console.log('PostgreSQL connection successful:', result.rows[0])
    return true
  } catch (error) {
    console.error('PostgreSQL connection failed:', error)
    return false
  }
}

// Close the connection pool
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('PostgreSQL connection pool closed')
  }
}

// Database schema setup
export async function setupDatabase(): Promise<void> {
  try {
    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await query(`
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
    `)

    await query(`
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
    `)

    await query(`
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
    `)

    await query(`
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
    `)

    // Route Planner Table
    await query(`
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
    `)

    // Organize Tour Table
    await query(`
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
    `)

    // Tour Destinations Table
    await query(`
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
    `)

    // Emergency Contacts Table
    await query(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id SERIAL PRIMARY KEY,
        contact_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        contact_type VARCHAR(50) NOT NULL,
        service_area VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address TEXT,
        is_24_7 BOOLEAN DEFAULT false,
        priority INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tour Participants Table
    await query(`
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
    `)

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_police_stations_location 
      ON police_stations(latitude, longitude)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_trips_user_id 
      ON trips(user_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id 
      ON trips(vehicle_id)
    `)

    // New table indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_route_plans_source_dest 
      ON route_plans(source, destination)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_route_plans_created_by 
      ON route_plans(created_by)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_tour_plans_organizer 
      ON tour_plans(organizer_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_tour_plans_dates 
      ON tour_plans(start_date, end_date)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_tour_destinations_tour_id 
      ON tour_destinations(tour_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_emergency_contacts_type 
      ON emergency_contacts(contact_type)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_emergency_contacts_location 
      ON emergency_contacts(latitude, longitude)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_tour_participants_tour_id 
      ON tour_participants(tour_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_tour_participants_user_id 
      ON tour_participants(user_id)
    `)

    console.log('PostgreSQL database schema setup completed')
  } catch (error) {
    console.error('Error setting up database schema:', error)
    throw error
  }
}

// Initialize database connection and setup
export async function initializeDatabase(): Promise<void> {
  try {
    const isConnected = await testConnection()
    if (isConnected) {
      await setupDatabase()
      console.log('PostgreSQL database initialized successfully')
    } else {
      throw new Error('Failed to connect to PostgreSQL database')
    }
  } catch (error) {
    console.error('Failed to initialize PostgreSQL database:', error)
    throw error
  }
}

export default {
  query,
  transaction,
  getClient,
  testConnection,
  setupDatabase,
  initializeDatabase,
  closePool
}
