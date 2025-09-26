# PostgreSQL Features for NeoThink-TourJet

This document describes the new PostgreSQL database features for Route Planner, Organize Tour, and Emergency Contacts.

## 🗄️ Database Tables

### 1. Route Plans (`route_plans`)
Stores detailed route planning information with cost calculations and traffic data.

**Fields:**
- `plan_id` - Unique identifier for the route plan
- `source` / `destination` - Start and end locations
- `source_lat` / `source_lng` / `dest_lat` / `dest_lng` - Coordinates
- `distance_km` - Total distance in kilometers
- `estimated_time_minutes` - Estimated travel time
- `route_polyline` - JSONB field storing route geometry
- `traffic_condition` - Current traffic status
- `weather_condition` - Weather information
- `fuel_cost` / `toll_cost` / `total_cost` - Cost breakdown
- `status` - Plan status (planned, active, completed)
- `created_by` - User who created the plan

### 2. Tour Plans (`tour_plans`)
Manages organized tour packages with participant tracking.

**Fields:**
- `tour_id` - Unique tour identifier
- `tour_name` - Name of the tour
- `description` - Tour description
- `start_date` / `end_date` - Tour duration
- `duration_days` - Number of days
- `max_participants` / `current_participants` - Capacity management
- `price_per_person` / `total_budget` - Pricing information
- `status` - Tour status (planning, active, completed, cancelled)
- `organizer_id` - User organizing the tour

### 3. Tour Destinations (`tour_destinations`)
Stores individual destinations within a tour with scheduling.

**Fields:**
- `tour_id` - Reference to tour plan
- `destination_name` - Name of the destination
- `latitude` / `longitude` - Location coordinates
- `visit_date` / `visit_time` - Scheduled visit
- `duration_hours` - Time spent at destination
- `cost` - Cost for this destination
- `description` - Destination details
- `order_sequence` - Visit order

### 4. Emergency Contacts (`emergency_contacts`)
Comprehensive emergency contact database with location-based filtering.

**Fields:**
- `contact_id` - Unique contact identifier
- `name` - Contact/service name
- `phone` / `email` - Contact information
- `contact_type` - Type (police, hospital, fire, ambulance, etc.)
- `service_area` - Geographic coverage
- `latitude` / `longitude` - Service location
- `address` - Physical address
- `is_24_7` - 24/7 availability
- `priority` - Priority level (1=highest, 5=lowest)
- `is_active` - Active status

### 5. Tour Participants (`tour_participants`)
Manages tour registrations and participant information.

**Fields:**
- `tour_id` - Reference to tour plan
- `user_id` - Reference to user
- `registration_date` - When they registered
- `payment_status` - Payment status
- `payment_amount` - Amount paid
- `special_requirements` - Special needs
- `emergency_contact_name` / `emergency_contact_phone` - Emergency contact
- `status` - Registration status

## 🚀 API Endpoints

### Route Planner API (`/api/route-planner`)

**GET** - Fetch route plans
- `?userId=123` - Get plans for specific user
- `?planId=RP001` - Get specific plan
- No params - Get all plans

**POST** - Create new route plan
```json
{
  "plan_id": "RP001",
  "source": "Madurai",
  "destination": "Chennai",
  "source_lat": 9.9252,
  "source_lng": 78.1198,
  "dest_lat": 13.0827,
  "dest_lng": 80.2707,
  "distance_km": 450.5,
  "estimated_time_minutes": 480,
  "traffic_condition": "normal",
  "fuel_cost": 2500.00,
  "toll_cost": 500.00,
  "total_cost": 3000.00,
  "created_by": 1
}
```

**PUT** - Update route plan
**DELETE** - Delete route plan

### Tours API (`/api/tours`)

**GET** - Fetch tours
- `?tourId=TP001` - Get specific tour with destinations and participants
- `?organizerId=123` - Get tours by organizer
- No params - Get all tours

**POST** - Create new tour
```json
{
  "tour_id": "TP001",
  "tour_name": "Tamil Nadu Heritage Tour",
  "description": "Explore rich heritage sites",
  "start_date": "2024-03-15",
  "end_date": "2024-03-20",
  "duration_days": 6,
  "max_participants": 25,
  "price_per_person": 15000.00,
  "total_budget": 375000.00,
  "organizer_id": 1,
  "destinations": [
    {
      "destination_name": "Meenakshi Temple",
      "latitude": 9.9196,
      "longitude": 78.1193,
      "visit_date": "2024-03-15",
      "visit_time": "09:00:00",
      "duration_hours": 3.00,
      "cost": 500.00,
      "order_sequence": 1
    }
  ]
}
```

**PUT** - Update tour
**DELETE** - Delete tour

### Tour Participants API (`/api/tours/participants`)

**GET** - Fetch participants
- `?tourId=TP001` - Get all participants for a tour
- `?userId=123` - Get all tours for a user
- No params - Get all participants

**POST** - Register for tour
```json
{
  "tour_id": "TP001",
  "user_id": 2,
  "payment_status": "pending",
  "payment_amount": 15000.00,
  "special_requirements": "Vegetarian meals",
  "emergency_contact_name": "John Doe",
  "emergency_contact_phone": "+91-9876543210"
}
```

**PUT** - Update participant details
**DELETE** - Unregister from tour

### Emergency Contacts API (`/api/emergency-contacts`)

**GET** - Fetch emergency contacts
- `?type=police` - Filter by contact type
- `?area=Madurai` - Filter by service area
- `?active=true` - Filter by active status

**POST** - Add new emergency contact
```json
{
  "contact_id": "EC001",
  "name": "Madurai Police Station",
  "phone": "+91-452-2345678",
  "email": "madurai.police@tn.gov.in",
  "contact_type": "police",
  "service_area": "Madurai",
  "latitude": 9.9252,
  "longitude": 78.1198,
  "address": "Madurai Main Police Station",
  "is_24_7": true,
  "priority": 1,
  "is_active": true
}
```

**PUT** - Update emergency contact
**DELETE** - Delete emergency contact

## 🛠️ Setup Instructions

### 1. Run Database Setup
```bash
npm run setup-postgres
```

### 2. Test Connection
```bash
npm run test-postgres
```

### 3. Environment Variables
Make sure your `.env` file contains:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=tourjet_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

## 📊 Sample Data

The setup script includes sample data for:

### Route Plans
- Madurai to Chennai (450.5 km, ₹3000 total cost)
- Chennai to Bangalore (350.2 km, ₹2100 total cost)
- Bangalore to Mysore (150.8 km, ₹900 total cost)

### Tour Plans
- Tamil Nadu Heritage Tour (6 days, ₹15,000 per person)
- Kerala Backwaters Experience (6 days, ₹18,000 per person)
- Karnataka Wildlife Safari (6 days, ₹20,000 per person)

### Emergency Contacts
- Police stations in major cities
- Hospitals and medical facilities
- Fire stations
- National emergency numbers (100, 102, 181, 1363)

## 🔧 Usage Examples

### Create a Route Plan
```javascript
const response = await fetch('/api/route-planner', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plan_id: 'RP004',
    source: 'Bangalore',
    destination: 'Goa',
    source_lat: 12.9716,
    source_lng: 77.5946,
    dest_lat: 15.2993,
    dest_lng: 74.1240,
    distance_km: 560.0,
    estimated_time_minutes: 600,
    traffic_condition: 'normal',
    fuel_cost: 3000.00,
    toll_cost: 800.00,
    total_cost: 3800.00,
    created_by: 1
  })
});
```

### Register for a Tour
```javascript
const response = await fetch('/api/tours/participants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tour_id: 'TP001',
    user_id: 3,
    payment_status: 'paid',
    payment_amount: 15000.00,
    special_requirements: 'Wheelchair accessible',
    emergency_contact_name: 'Jane Smith',
    emergency_contact_phone: '+91-9876543210'
  })
});
```

### Get Emergency Contacts by Type
```javascript
const response = await fetch('/api/emergency-contacts?type=police&area=Chennai');
const contacts = await response.json();
```

## 🎯 Features

### Route Planner
- ✅ Store detailed route information with coordinates
- ✅ Track costs (fuel, toll, total)
- ✅ Monitor traffic and weather conditions
- ✅ Store route polylines for map display
- ✅ User-specific route history

### Organize Tour
- ✅ Create comprehensive tour packages
- ✅ Manage multiple destinations with scheduling
- ✅ Track participant registrations
- ✅ Handle payments and special requirements
- ✅ Capacity management (max participants)

### Emergency Contacts
- ✅ Location-based contact filtering
- ✅ Multiple contact types (police, hospital, fire, etc.)
- ✅ Priority-based sorting
- ✅ 24/7 availability tracking
- ✅ Service area coverage

## 🔍 Database Indexes

Optimized indexes for fast queries:
- Location-based searches (latitude, longitude)
- User-specific data (created_by, organizer_id)
- Date range queries (start_date, end_date)
- Contact type filtering
- Tour participant lookups

Your NeoThink-TourJet application now has a complete PostgreSQL backend for route planning, tour organization, and emergency contact management!
