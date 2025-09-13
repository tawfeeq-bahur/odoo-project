import { NextRequest, NextResponse } from 'next/server';
import { getAdminCollection, getEmployeeCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const results = {
      adminDb: { collections: [], message: '' },
      employeeDb: { collections: [], message: '' },
      errors: [] as string[]
    };

    try {
      // Initialize Admin Database Collections
      const adminCollections = [
        'vehicles',
        'trips', 
        'admins',
        'routes',
        'fleet_settings',
        'maintenance_records',
        'fuel_records'
      ];

      for (const collectionName of adminCollections) {
        try {
          const collection = await getAdminCollection(collectionName);
          await collection.createIndex({ createdAt: 1 });
          (results.adminDb.collections as string[]).push(collectionName);
        } catch (error) {
          results.errors.push(`Failed to create admin collection ${collectionName}: ${error}`);
        }
      }

      // Add specific indexes for admin collections
      try {
        const vehicles = await getAdminCollection('vehicles');
        await vehicles.createIndex({ plateNumber: 1 }, { unique: true });
        await vehicles.createIndex({ status: 1 });
        await vehicles.createIndex({ assignedTo: 1 });
      } catch (error) {
        results.errors.push(`Failed to create vehicle indexes: ${error}`);
      }

      try {
        const trips = await getAdminCollection('trips');
        await trips.createIndex({ vehicleId: 1 });
        await trips.createIndex({ employeeName: 1 });
        await trips.createIndex({ status: 1 });
        await trips.createIndex({ startDate: -1 });
      } catch (error) {
        results.errors.push(`Failed to create trip indexes: ${error}`);
      }

      results.adminDb.message = `Admin database initialized with ${results.adminDb.collections.length} collections`;

    } catch (error) {
      results.errors.push(`Admin DB initialization failed: ${error}`);
    }

    try {
      // Initialize Employee Database Collections
      const employeeCollections = [
        'employee_profiles',
        'odometer_readings',
        'expenses',
        'employee_trips',
        'emergency_contacts',
        'reminders',
        'employee_settings'
      ];

      for (const collectionName of employeeCollections) {
        try {
          const collection = await getEmployeeCollection(collectionName);
          await collection.createIndex({ createdAt: 1 });
          (results.employeeDb.collections as string[]).push(collectionName);
        } catch (error) {
          results.errors.push(`Failed to create employee collection ${collectionName}: ${error}`);
        }
      }

      // Add specific indexes for employee collections
      try {
        const profiles = await getEmployeeCollection('employee_profiles');
        await profiles.createIndex({ employeeId: 1 }, { unique: true });
        await profiles.createIndex({ assignedVehicleId: 1 });
      } catch (error) {
        results.errors.push(`Failed to create profile indexes: ${error}`);
      }

      try {
        const odometer = await getEmployeeCollection('odometer_readings');
        await odometer.createIndex({ driverId: 1 });
        await odometer.createIndex({ vehicleId: 1 });
        await odometer.createIndex({ status: 1 });
        await odometer.createIndex({ submittedAt: -1 });
      } catch (error) {
        results.errors.push(`Failed to create odometer indexes: ${error}`);
      }

      try {
        const expenses = await getEmployeeCollection('expenses');
        await expenses.createIndex({ employeeId: 1 });
        await expenses.createIndex({ status: 1 });
        await expenses.createIndex({ date: -1 });
        await expenses.createIndex({ tripId: 1 });
      } catch (error) {
        results.errors.push(`Failed to create expense indexes: ${error}`);
      }

      results.employeeDb.message = `Employee database initialized with ${results.employeeDb.collections.length} collections`;

    } catch (error) {
      results.errors.push(`Employee DB initialization failed: ${error}`);
    }

    // Insert sample data if requested
    const body = await request.json().catch(() => ({}));
    if (body.includeSampleData) {
      try {
        // Sample admin data
        const vehicles = await getAdminCollection('vehicles');
        const sampleVehicles = [
          {
            id: 'vehicle_001',
            name: 'Fleet Car 1',
            plateNumber: 'ABC-123',
            model: 'Toyota Camry 2023',
            status: 'Idle',
            fuelLevel: 85,
            lastMaintenance: new Date().toISOString(),
            assignedTo: null
          },
          {
            id: 'vehicle_002', 
            name: 'Fleet Car 2',
            plateNumber: 'XYZ-789',
            model: 'Honda Accord 2022',
            status: 'On Trip',
            fuelLevel: 60,
            lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'john.doe'
          }
        ];

        for (const vehicle of sampleVehicles) {
          await vehicles.updateOne(
            { id: vehicle.id },
            { $set: vehicle },
            { upsert: true }
          );
        }

        // Sample employee data
        const profiles = await getEmployeeCollection('employee_profiles');
        const sampleProfile = {
          id: 'emp_001',
          name: 'John Doe',
          employeeId: 'EMP001',
          email: 'john.doe@company.com',
          phone: '+1-555-0123',
          department: 'Sales',
          position: 'Sales Representative',
          assignedVehicleId: 'vehicle_002',
          emergencyContacts: [
            {
              name: 'Jane Doe',
              phone: '+1-555-0124',
              relationship: 'Spouse'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await profiles.updateOne(
          { employeeId: sampleProfile.employeeId },
          { $set: sampleProfile },
          { upsert: true }
        );

        results.adminDb.message += ' (with sample data)';
        results.employeeDb.message += ' (with sample data)';

      } catch (error) {
        results.errors.push(`Failed to insert sample data: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialization completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database initialization endpoint',
    usage: 'POST to initialize databases with optional sample data',
    body: {
      includeSampleData: 'boolean (optional) - whether to include sample data'
    }
  });
}
