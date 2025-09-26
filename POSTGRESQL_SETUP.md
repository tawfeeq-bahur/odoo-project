# PostgreSQL Database Setup Guide for NeoThink-TourJet

This guide will help you set up PostgreSQL database connection for your NeoThink-TourJet application.

## Prerequisites

1. **PostgreSQL installed on your system**
   - Download from: https://www.postgresql.org/download/
   - Make sure PostgreSQL service is running

2. **Node.js and npm** (already installed)

## Step 1: Install PostgreSQL Dependencies

The PostgreSQL dependencies are already installed. If you need to reinstall:

```bash
npm install pg @types/pg
```

## Step 2: Set Up Your PostgreSQL Database

### Option A: Using the Setup Script (Recommended)

1. **Run the setup script:**
   ```bash
   npm run setup-postgres
   ```

   This script will:
   - Test your PostgreSQL connection
   - Create the database schema
   - Insert sample data
   - Create a `.env` file with configuration

### Option B: Manual Setup

1. **Create a database:**
   ```sql
   CREATE DATABASE tourjet_db;
   ```

2. **Create a user (optional):**
   ```sql
   CREATE USER tourjet_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE tourjet_db TO tourjet_user;
   ```

3. **Update your `.env` file:**
   ```env
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=tourjet_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   ```

## Step 3: Test Your Connection

Run the test script to verify everything is working:

```bash
npm run test-postgres
```

You should see:
- ✅ Connection successful
- ✅ Database tables created
- ✅ Sample data inserted

## Step 4: Update Your Application

The PostgreSQL connection is now ready to use. You can import and use it in your application:

```typescript
import { query, transaction, initializeDatabase } from '@/lib/postgresql'

// Example usage
async function getUsers() {
  const result = await query('SELECT * FROM users')
  return result.rows
}

// Initialize database on app startup
await initializeDatabase()
```

## Database Schema

The setup creates the following tables:

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `name`
- `role` (admin/employee)
- `created_at`, `updated_at`

### Vehicles Table
- `id` (Primary Key)
- `vehicle_id` (Unique)
- `make`, `model`, `year`
- `license_plate`
- `status`
- `created_at`, `updated_at`

### Routes Table
- `id` (Primary Key)
- `route_id` (Unique)
- `source`, `destination`
- `distance_km`, `estimated_time_minutes`
- `created_at`, `updated_at`

### Trips Table
- `id` (Primary Key)
- `trip_id` (Unique)
- `user_id` (Foreign Key)
- `vehicle_id` (Foreign Key)
- `route_id` (Foreign Key)
- `start_time`, `end_time`
- `status`
- `created_at`, `updated_at`

### Police Stations Table
- `id` (Primary Key)
- `name`
- `latitude`, `longitude`
- `phone`, `address`
- `created_at`, `updated_at`

## Troubleshooting

### Connection Issues

1. **Check PostgreSQL service:**
   ```bash
   # Windows
   services.msc
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. **Verify credentials:**
   - Check your `.env` file
   - Test connection with psql:
     ```bash
     psql -h localhost -U postgres -d tourjet_db
     ```

3. **Check firewall/port:**
   - Default PostgreSQL port is 5432
   - Make sure it's not blocked

### Permission Issues

1. **Grant proper permissions:**
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE tourjet_db TO your_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
   ```

### Database Not Found

1. **Create the database:**
   ```sql
   CREATE DATABASE tourjet_db;
   ```

## Environment Variables

Make sure your `.env` file contains:

```env
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=tourjet_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# MongoDB Configuration (existing)
MONGODB_URI=mongodb://localhost:27017
MONGODB_URI_ADMIN=mongodb://localhost:27017
MONGODB_URI_EMPLOYEE=mongodb://localhost:27017
MONGODB_DB_ADMIN=admin_db
MONGODB_DB_EMPLOYEE=emp_db
```

## Next Steps

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Your application now supports both MongoDB and PostgreSQL!**

3. **You can use PostgreSQL for:**
   - User management
   - Route storage
   - Trip tracking
   - Police station data
   - Any relational data needs

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Run `npm run test-postgres` to diagnose connection issues
3. Verify your PostgreSQL installation and service status
4. Check your `.env` file configuration

Your NeoThink-TourJet application is now ready to use PostgreSQL alongside MongoDB!
