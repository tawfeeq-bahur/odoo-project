# Routes Database Setup Guide

This guide explains how to set up and use the routes functionality in the Fleet Management System.

## Overview

The routes system allows administrators to:
- Save route data with emissions calculations
- View the last route assigned by admin
- Track environmental impact of routes

## Features Added

### 1. Routes API Endpoints

#### `GET /api/routes/last`
Retrieves the most recent route assigned by admin.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "route_id",
    "source": "New York, NY",
    "destination": "Boston, MA",
    "vehicleType": "petrol",
    "vehicleYear": 2020,
    "fuelType": "gasoline",
    "distance": 350,
    "emissions": 45.5,
    "routeSource": "OSM",
    "routeType": "highway",
    "traffic": "moderate",
    "ecoTip": "Consider taking the scenic route...",
    "date": "2024-01-15T10:30:00.000Z"
  },
  "message": "Last route retrieved successfully"
}
```

#### `POST /api/routes/save`
Saves a new route with emissions data.

**Request Body:**
```json
{
  "source": "New York, NY",
  "destination": "Boston, MA",
  "vehicleType": "petrol",
  "vehicleYear": 2020,
  "fuelType": "gasoline",
  "distance": 350,
  "emissions": 45.5,
  "routeSource": "OSM",
  "routeType": "highway",
  "traffic": "moderate",
  "ecoTip": "Consider taking the scenic route..."
}
```

### 2. Admin User Management

#### `POST /api/admin/create-admin`
Creates a default admin user with username "admin" and password "123".

#### `POST /api/admin/seed`
Enhanced to include password field for admin creation.

### 3. Routes Page

A new `/routes` page displays:
- Last route assigned by admin
- Route details (source, destination, distance, emissions)
- Vehicle information
- Environmental tips
- Refresh functionality

## Setup Instructions

### 1. Quick Setup (Recommended)

Run the automated setup script:

```bash
npm run setup
```

This will:
- Test database connection
- Initialize database collections
- Create admin user (username: admin, password: 123)
- Test routes functionality
- Seed a sample route

### 2. Manual Setup

If you prefer to set up manually:

#### Step 1: Initialize Database
```bash
curl -X POST http://localhost:3000/api/admin/init-db
```

#### Step 2: Create Admin User
```bash
curl -X POST http://localhost:3000/api/admin/create-admin
```

#### Step 3: Test Routes Endpoint
```bash
curl http://localhost:3000/api/routes/last
```

### 3. Testing

Run the test script to verify everything works:

```bash
npm run test-routes
```

## Usage

### For Administrators

1. **Login** with username: `admin`, password: `123`
2. **Navigate** to the "Routes" page from the sidebar
3. **View** the last assigned route with all details
4. **Refresh** to get the latest route data

### For Developers

#### Adding New Routes

```javascript
const newRoute = {
  source: "San Francisco, CA",
  destination: "Los Angeles, CA",
  vehicleType: "electric",
  vehicleYear: 2023,
  fuelType: "electricity",
  distance: 380,
  emissions: 12.5,
  routeSource: "OSM",
  routeType: "highway",
  traffic: "light",
  ecoTip: "Great choice! Electric vehicles produce zero direct emissions."
};

const response = await fetch('/api/routes/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newRoute)
});
```

#### Fetching Last Route

```javascript
const response = await fetch('/api/routes/last');
const data = await response.json();

if (data.success) {
  console.log('Last route:', data.data);
} else {
  console.log('No routes found');
}
```

## Database Schema

### Routes Collection

```javascript
{
  _id: ObjectId,
  source: String,           // Starting location
  destination: String,      // Ending location
  vehicleType: String,      // petrol, diesel, electric, etc.
  vehicleYear: Number,      // Year of vehicle
  fuelType: String,         // Type of fuel used
  distance: Number,         // Distance in kilometers
  emissions: Number,        // CO2 emissions in grams
  routeSource: String,      // Source of route data (OSM, Google, etc.)
  routeType: String,        // Type of route (highway, city, etc.)
  traffic: String,          // Traffic conditions
  claimedEfficiency: Number, // Vehicle efficiency claim
  claimedEfficiencyUnit: String, // Unit of efficiency
  electricitySource: String, // Source of electricity for EVs
  ecoTip: String,           // Environmental tip
  date: Date               // When route was created
}
```

### Admins Collection

```javascript
{
  _id: ObjectId,
  username: String,         // Admin username
  password: String,         // Admin password
  role: String,            // User role (admin)
  createdAt: Date,         // When admin was created
  note: String             // Additional notes
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure MongoDB is running on localhost:27017
   - Check your environment variables

2. **Admin User Already Exists**
   - This is normal - the system will return the existing admin
   - No duplicate users will be created

3. **No Routes Found**
   - This is normal if no routes have been saved yet
   - Use the sample route creation in the setup script

4. **Routes Page Not Loading**
   - Check that the development server is running
   - Verify the routes page is accessible at `/routes`

### Environment Variables

Make sure these are set in your `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_URI_ADMIN=mongodb://localhost:27017
MONGODB_URI_EMPLOYEE=mongodb://localhost:27017
MONGODB_DB_ADMIN=admin_db
MONGODB_DB_EMPLOYEE=emp_db
```

## API Reference

### Routes Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes/last` | Get the last assigned route |
| POST | `/api/routes/save` | Save a new route |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/create-admin` | Create default admin user |
| POST | `/api/admin/seed` | Seed admin with custom data |
| GET | `/api/admin/seed` | Check admin collection status |

## Next Steps

1. **Customize** the routes page UI to match your design
2. **Add** more route validation and error handling
3. **Implement** route history and analytics
4. **Add** route comparison features
5. **Integrate** with real-time traffic data

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify database connectivity
3. Run the test script to diagnose problems
4. Check the API endpoints directly with curl or Postman

---

**Happy coding! 🚀**
