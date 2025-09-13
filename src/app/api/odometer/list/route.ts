import { NextRequest, NextResponse } from 'next/server';
import { OdometerReading } from '@/lib/types';
import { getEmployeeCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const driverId = searchParams.get('driverId');

    // Build filter query
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (driverId) {
      filter.driverId = driverId;
    }

    // Fetch from employee database
    const odometerCollection = await getEmployeeCollection<OdometerReading>('odometer_readings');
    const readings = await odometerCollection.find(filter).sort({ submittedAt: -1 }).toArray();

    return NextResponse.json(readings);
  } catch (error) {
    console.error('Error fetching odometer readings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
