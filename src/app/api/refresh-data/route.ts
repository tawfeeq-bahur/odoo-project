import { NextRequest, NextResponse } from 'next/server';
import { getAdminCollection, getEmployeeCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const data: any = {};

    if (type === 'all' || type === 'vehicles') {
      const vehicles = await getAdminCollection('vehicles');
      data.vehicles = await vehicles.find({}).toArray();
    }

    if (type === 'all' || type === 'trips') {
      const trips = await getAdminCollection('trips');
      data.trips = await trips.find({}).toArray();
    }

    if (type === 'all' || type === 'routes') {
      const routes = await getAdminCollection('routes');
      data.routes = await routes.find({}).toArray();
    }

    if (type === 'all' || type === 'expenses') {
      const expenses = await getEmployeeCollection('expenses');
      data.expenses = await expenses.find({}).toArray();
    }

    if (type === 'all' || type === 'maintenance') {
      const maintenance = await getAdminCollection('maintenance_records');
      data.maintenance = await maintenance.find({}).toArray();
    }

    if (type === 'all' || type === 'fuel') {
      const fuel = await getAdminCollection('fuel_records');
      data.fuel = await fuel.find({}).toArray();
    }

    if (type === 'all' || type === 'employees') {
      const employees = await getEmployeeCollection('employee_profiles');
      data.employees = await employees.find({}).toArray();
    }

    return NextResponse.json({
      success: true,
      message: 'Data refreshed successfully',
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data refresh error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Data refresh failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
