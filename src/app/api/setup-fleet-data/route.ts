import { NextRequest, NextResponse } from 'next/server';
import { getAdminCollection, getEmployeeCollection } from '@/lib/mongodb';
import { Vehicle, EmployeeProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const results = {
      vehicles: { created: 0, errors: [] as string[] },
      employees: { created: 0, errors: [] as string[] },
      assignments: { updated: 0, errors: [] as string[] }
    };

    // Clear existing data first
    try {
      await getAdminCollection('vehicles').then(col => col.deleteMany({}));
      await getEmployeeCollection('employees').then(col => col.deleteMany({}));
      await getEmployeeCollection('employee_profiles').then(col => col.deleteMany({}));
    } catch (error) {
      console.log('Clearing existing data:', error);
    }

    // Create vehicles
    const vehiclesData: Vehicle[] = [
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
        await getAdminCollection<Vehicle>('vehicles').then(col => col.insertOne(vehicle));
        results.vehicles.created++;
      } catch (error) {
        results.vehicles.errors.push(`Vehicle ${vehicle.id}: ${error}`);
      }
    }

    // Create employee profiles
    const employeesData: EmployeeProfile[] = [
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
        await getEmployeeCollection<EmployeeProfile>('employee_profiles').then(col => col.insertOne(employee));
        results.employees.created++;
      } catch (error) {
        results.employees.errors.push(`Employee ${employee.employeeId}: ${error}`);
      }
    }

    // Add some sample expenses for the employees
    const expensesData = [
      {
        id: 'expense_001',
        employeeId: 'EMP001',
        type: 'Fuel',
        amount: 17575,
        date: '2024-09-10',
        status: 'approved'
      },
      {
        id: 'expense_002',
        employeeId: 'EMP002',
        type: 'Fuel',
        amount: 45000,
        date: '2024-09-11',
        status: 'approved'
      }
    ];

    for (const expense of expensesData) {
      try {
        await getEmployeeCollection('expenses').then(col => col.insertOne(expense));
      } catch (error) {
        console.log('Expense error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Fleet data setup completed',
      results,
      summary: {
        vehiclesCreated: results.vehicles.created,
        employeesCreated: results.employees.created,
        totalErrors: results.vehicles.errors.length + results.employees.errors.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fleet data setup error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Fleet data setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Fleet data setup endpoint',
    usage: 'POST to initialize fleet data with 3 vehicles and 2 employees',
    description: 'This endpoint will clear existing data and create fresh fleet data matching your UI'
  });
}
