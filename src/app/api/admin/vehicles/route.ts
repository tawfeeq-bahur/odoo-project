import { NextRequest, NextResponse } from 'next/server';
import { getAdminCollection } from '@/lib/mongodb';
import { Vehicle } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const vehicles = await getAdminCollection<Vehicle>('vehicles');
    const allVehicles = await vehicles.find({}).toArray();
    
    return NextResponse.json(allVehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
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
    if (!body.name || !body.plateNumber || !body.model) {
      return NextResponse.json(
        { error: 'Missing required fields: name, plateNumber, model' },
        { status: 400 }
      );
    }

    const vehicle: Vehicle = {
      id: body.id || `vehicle_${Date.now()}`,
      name: body.name,
      plateNumber: body.plateNumber,
      model: body.model,
      status: body.status || 'Idle',
      fuelLevel: body.fuelLevel || 100,
      lastMaintenance: body.lastMaintenance || new Date().toISOString(),
      assignedTo: body.assignedTo || null,
    };

    const vehicles = await getAdminCollection<Vehicle>('vehicles');
    const result = await vehicles.insertOne(vehicle);
    
    return NextResponse.json({ 
      success: true, 
      vehicle: { ...vehicle, _id: result.insertedId },
      message: 'Vehicle added successfully' 
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
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
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    const vehicles = await getAdminCollection<Vehicle>('vehicles');
    const result = await vehicles.updateOne(
      { id: body.id },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle updated successfully' 
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('id');
    
    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    const vehicles = await getAdminCollection<Vehicle>('vehicles');
    const result = await vehicles.deleteOne({ id: vehicleId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
