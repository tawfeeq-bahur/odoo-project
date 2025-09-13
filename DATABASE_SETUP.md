# Database Setup Guide

This guide explains how to set up and use the MongoDB databases for the Fleet Management System.

## Database Structure

The system uses two separate MongoDB databases:

### 1. Admin Database (`admin_db`)
Contains data managed by administrators:
- **vehicles** - Fleet vehicle information
- **trips** - Trip records and planning
- **admins** - Admin user accounts
- **routes** - Saved routes and emissions data
- **fleet_settings** - System configuration
- **maintenance_records** - Vehicle maintenance history
- **fuel_records** - Fuel consumption tracking

### 2. Employee Database (`emp_db`)
Contains data managed by employees:
- **employee_profiles** - Employee information and settings
- **odometer_readings** - Odometer submissions with photos
- **expenses** - Expense claims and reimbursements
- **employee_trips** - Personal trip records
- **emergency_contacts** - Emergency contact information
- **reminders** - Personal reminders and notifications
- **employee_settings** - Personal preferences

## Connection Configuration

The system is configured to connect to your local MongoDB Compass instance:
- **Connection URI**: `mongodb://localhost:27017`
- **Admin Database**: `admin_db`
- **Employee Database**: `emp_db`

## API Endpoints

### Database Management
- `GET /api/test-connection` - Test database connections
- `POST /api/admin/init-db` - Initialize databases with collections and indexes
- `GET /api/admin/seed` - Seed admin data
- `GET /api/employee/seed` - Seed employee data

### Admin APIs
- `GET/POST/PUT/DELETE /api/admin/vehicles` - Vehicle management
- `GET/POST/PUT /api/admin/trips` - Trip management
- `POST /api/routes/save` - Save route data

### Employee APIs
- `GET/POST/PUT /api/employee/profile` - Employee profile management
- `GET/POST/PUT /api/employee/expenses` - Expense management
- `POST /api/odometer/submit` - Submit odometer readings
- `GET /api/odometer/list` - List odometer readings
- `PUT /api/odometer/update-status` - Update odometer status

## Setup Instructions

### 1. Start MongoDB Compass
Make sure your MongoDB Compass is running on `localhost:27017`

### 2. Initialize Databases
Run the initialization endpoint to create collections and indexes:

```bash
curl -X POST http://localhost:9002/api/admin/init-db \
  -H "Content-Type: application/json" \
  -d '{"includeSampleData": true}'
```

### 3. Test Connections
Verify that both databases are connected:

```bash
curl http://localhost:9002/api/test-connection
```

### 4. Seed Sample Data (Optional)
Add sample admin and employee data:

```bash
# Seed admin data
curl -X POST http://localhost:9002/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"username": "admin"}'

# Seed employee data
curl -X POST http://localhost:9002/api/employee/seed \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "employeeId": "EMP001"}'
```

## Data Flow

### Admin Data Flow
1. Admin creates vehicles and trip plans
2. Data stored in `admin_db`
3. Admin can view and manage all fleet data
4. Admin approves/rejects employee submissions

### Employee Data Flow
1. Employee submits odometer readings and expenses
2. Data stored in `emp_db`
3. Employee can view their own data
4. Admin reviews and approves submissions

## Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_URI_ADMIN=mongodb://localhost:27017
MONGODB_URI_EMPLOYEE=mongodb://localhost:27017
MONGODB_DB_ADMIN=admin_db
MONGODB_DB_EMPLOYEE=emp_db
```

## Troubleshooting

### Connection Issues
1. Ensure MongoDB Compass is running
2. Check the connection URI in your environment
3. Verify database names are correct
4. Run the test connection endpoint

### Data Issues
1. Check if collections exist using MongoDB Compass
2. Verify indexes are created properly
3. Check API endpoint responses for errors
4. Review server logs for detailed error messages

## Security Notes

- The current setup uses local MongoDB without authentication
- For production, implement proper authentication and authorization
- Use environment variables for sensitive configuration
- Implement proper data validation and sanitization