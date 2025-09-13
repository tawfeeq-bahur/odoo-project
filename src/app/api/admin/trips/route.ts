import { NextRequest, NextResponse } from 'next/server';
import { getAdminCollection } from '@/lib/mongodb';
import { Trip } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vehicleId = searchParams.get('vehicleId');
    const employeeName = searchParams.get('employeeName');

    // Build filter query
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (vehicleId) {
      filter.vehicleId = vehicleId;
    }
    if (employeeName) {
      filter.employeeName = employeeName;
    }

    const trips = await getAdminCollection<Trip>('trips');
    const allTrips = await trips.find(filter).sort({ startDate: -1 }).toArray();
    
    return NextResponse.json(allTrips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.vehicleId || !body.employeeName || !body.source || !body.destination) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicleId, employeeName, source, destination' },
        { status: 400 }
      );
    }

    const trip: Trip = {
      id: body.id || `trip_${Date.now()}`,
      vehicleId: body.vehicleId,
      employeeName: body.employeeName,
      source: body.source,
      destination: body.destination,
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || undefined,
      status: body.status || 'Planned',
      expenses: body.expenses || [],
      plan: body.plan || {},
    };

    const trips = await getAdminCollection<Trip>('trips');
    const result = await trips.insertOne(trip);
    
    return NextResponse.json({ 
      success: true, 
      trip: { ...trip, _id: result.insertedId },
      message: 'Trip created successfully' 
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    const trips = await getAdminCollection<Trip>('trips');
    const result = await trips.updateOne(
      { id: body.id },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Trip updated successfully' 
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
