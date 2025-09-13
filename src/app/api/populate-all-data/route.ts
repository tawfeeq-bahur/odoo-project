import { NextRequest, NextResponse } from 'next/server';
import { getAdminCollection, getEmployeeCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const results = {
      vehicles: { created: 0, errors: [] as string[] },
      trips: { created: 0, errors: [] as string[] },
      routes: { created: 0, errors: [] as string[] },
      expenses: { created: 0, errors: [] as string[] },
      maintenance: { created: 0, errors: [] as string[] },
      fuel: { created: 0, errors: [] as string[] },
      employees: { created: 0, errors: [] as string[] }
    };

    // Clear existing data first
    try {
      await getAdminCollection('vehicles').then(col => col.deleteMany({}));
      await getAdminCollection('trips').then(col => col.deleteMany({}));
      await getAdminCollection('routes').then(col => col.deleteMany({}));
      await getAdminCollection('maintenance_records').then(col => col.deleteMany({}));
      await getAdminCollection('fuel_records').then(col => col.deleteMany({}));
      await getEmployeeCollection('employee_profiles').then(col => col.deleteMany({}));
      await getEmployeeCollection('expenses').then(col => col.deleteMany({}));
    } catch (error) {
      console.log('Clearing existing data:', error);
    }

    // Create vehicles
    const vehiclesData = [
      {
        id: 'vehicle_001',
        name: 'Volvo Prime Mover VNL 860',
        plateNumber: 'TRK-001',
        model: 'Volvo Prime Mover VNL 860',
        status: 'Idle',
        fuelLevel: 75,
        lastMaintenance: '2024-06-15T00:00:00.000Z',
        assignedTo: 'EMP001'
      },
      {
        id: 'vehicle_002',
        name: 'Ford Transit Van Transit-250',
        plateNumber: 'VAN-002',
        model: 'Ford Transit Van Transit-250',
        status: 'Idle',
        fuelLevel: 90,
        lastMaintenance: '2024-07-20T00:00:00.000Z',
        assignedTo: 'EMP002'
      },
      {
        id: 'vehicle_003',
        name: 'Scania Rigid Truck',
        plateNumber: 'TRK-003',
        model: 'Scania Rigid Truck',
        status: 'Maintenance',
        fuelLevel: 20,
        lastMaintenance: '2025-09-13T00:00:00.000Z',
        assignedTo: null
      }
    ];

    for (const vehicle of vehiclesData) {
      try {
        await getAdminCollection('vehicles').then(col => col.insertOne(vehicle));
        results.vehicles.created++;
      } catch (error) {
        results.vehicles.errors.push(`Vehicle ${vehicle.id}: ${error}`);
      }
    }

    // Create employees
    const employeesData = [
      {
        id: 'emp_001',
        name: 'Raja',
        employeeId: 'EMP001',
        email: 'raja@fleetflow.com',
        phone: '+1-555-0101',
        department: 'Operations',
        position: 'Driver',
        assignedVehicleId: 'vehicle_001',
        emergencyContacts: [
          {
            name: 'Raja Emergency',
            phone: '+1-555-0102',
            relationship: 'Spouse'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'emp_002',
        name: 'Ram',
        employeeId: 'EMP002',
        email: 'ram@fleetflow.com',
        phone: '+1-555-0201',
        department: 'Operations',
        position: 'Driver',
        assignedVehicleId: 'vehicle_002',
        emergencyContacts: [
          {
            name: 'Ram Emergency',
            phone: '+1-555-0202',
            relationship: 'Spouse'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const employee of employeesData) {
      try {
        await getEmployeeCollection('employee_profiles').then(col => col.insertOne(employee));
        results.employees.created++;
      } catch (error) {
        results.employees.errors.push(`Employee ${employee.employeeId}: ${error}`);
      }
    }

    // Create trips
    const tripsData = [
      {
        id: 'trip_001',
        vehicleId: 'vehicle_001',
        employeeName: 'Raja',
        source: 'New York',
        destination: 'Boston',
        startDate: '2024-09-10T08:00:00.000Z',
        endDate: '2024-09-10T16:00:00.000Z',
        status: 'Completed',
        expenses: [],
        plan: {
          source: 'New York',
          destination: 'Boston',
          distance: 200,
          estimatedTime: '8 hours',
          route: 'I-95 N'
        }
      },
      {
        id: 'trip_002',
        vehicleId: 'vehicle_002',
        employeeName: 'Ram',
        source: 'Los Angeles',
        destination: 'San Francisco',
        startDate: '2024-09-12T09:00:00.000Z',
        endDate: null,
        status: 'Ongoing',
        expenses: [],
        plan: {
          source: 'Los Angeles',
          destination: 'San Francisco',
          distance: 380,
          estimatedTime: '6 hours',
          route: 'I-5 N'
        }
      }
    ];

    for (const trip of tripsData) {
      try {
        await getAdminCollection('trips').then(col => col.insertOne(trip));
        results.trips.created++;
      } catch (error) {
        results.trips.errors.push(`Trip ${trip.id}: ${error}`);
      }
    }

    // Create routes
    const routesData = [
      {
        source: 'New York',
        destination: 'Boston',
        vehicleType: 'Truck',
        vehicleYear: 2023,
        fuelType: 'Diesel',
        distance: 200,
        emissions: 45.2,
        routeSource: 'OSM',
        routeType: 'Highway',
        traffic: 'Normal',
        date: new Date('2024-09-10')
      },
      {
        source: 'Los Angeles',
        destination: 'San Francisco',
        vehicleType: 'Van',
        vehicleYear: 2022,
        fuelType: 'Gasoline',
        distance: 380,
        emissions: 67.8,
        routeSource: 'OSM',
        routeType: 'Highway',
        traffic: 'Heavy',
        date: new Date('2024-09-12')
      }
    ];

    for (const route of routesData) {
      try {
        await getAdminCollection('routes').then(col => col.insertOne(route));
        results.routes.created++;
      } catch (error) {
        results.routes.errors.push(`Route ${route.source}-${route.destination}: ${error}`);
      }
    }

    // Create expenses
    const expensesData = [
      {
        id: 'expense_001',
        employeeId: 'EMP001',
        type: 'Fuel',
        amount: 17575,
        date: '2024-09-10',
        tripId: 'trip_001',
        status: 'approved'
      },
      {
        id: 'expense_002',
        employeeId: 'EMP002',
        type: 'Fuel',
        amount: 45000,
        date: '2024-09-12',
        tripId: 'trip_002',
        status: 'pending'
      },
      {
        id: 'expense_003',
        employeeId: 'EMP001',
        type: 'Toll',
        amount: 2500,
        date: '2024-09-10',
        tripId: 'trip_001',
        status: 'approved'
      }
    ];

    for (const expense of expensesData) {
      try {
        await getEmployeeCollection('expenses').then(col => col.insertOne(expense));
        results.expenses.created++;
      } catch (error) {
        results.expenses.errors.push(`Expense ${expense.id}: ${error}`);
      }
    }

    // Create maintenance records
    const maintenanceData = [
      {
        id: 'maint_001',
        vehicleId: 'vehicle_001',
        type: 'Regular Service',
        description: 'Oil change and filter replacement',
        cost: 150.00,
        date: '2024-06-15T00:00:00.000Z',
        mileage: 50000,
        status: 'completed'
      },
      {
        id: 'maint_002',
        vehicleId: 'vehicle_003',
        type: 'Engine Repair',
        description: 'Engine overhaul and parts replacement',
        cost: 2500.00,
        date: '2024-09-13T00:00:00.000Z',
        mileage: 75000,
        status: 'in_progress'
      }
    ];

    for (const maintenance of maintenanceData) {
      try {
        await getAdminCollection('maintenance_records').then(col => col.insertOne(maintenance));
        results.maintenance.created++;
      } catch (error) {
        results.maintenance.errors.push(`Maintenance ${maintenance.id}: ${error}`);
      }
    }

    // Create fuel records
    const fuelData = [
      {
        id: 'fuel_001',
        vehicleId: 'vehicle_001',
        amount: 50.5,
        cost: 175.75,
        date: '2024-09-10T08:00:00.000Z',
        location: 'New York Gas Station',
        mileage: 50000
      },
      {
        id: 'fuel_002',
        vehicleId: 'vehicle_002',
        amount: 45.0,
        cost: 180.00,
        date: '2024-09-12T09:00:00.000Z',
        location: 'Los Angeles Gas Station',
        mileage: 35000
      }
    ];

    for (const fuel of fuelData) {
      try {
        await getAdminCollection('fuel_records').then(col => col.insertOne(fuel));
        results.fuel.created++;
      } catch (error) {
        results.fuel.errors.push(`Fuel ${fuel.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All data populated successfully',
      results,
      summary: {
        vehiclesCreated: results.vehicles.created,
        tripsCreated: results.trips.created,
        routesCreated: results.routes.created,
        expensesCreated: results.expenses.created,
        maintenanceCreated: results.maintenance.created,
        fuelCreated: results.fuel.created,
        employeesCreated: results.employees.created,
        totalErrors: Object.values(results).reduce((sum, category) => sum + category.errors.length, 0)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data population error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Data population failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Data population endpoint',
    usage: 'POST to populate all collections with sample data',
    description: 'This endpoint will clear existing data and create comprehensive sample data for all collections'
  });
}
