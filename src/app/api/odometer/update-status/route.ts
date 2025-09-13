import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeCollection } from '@/lib/mongodb';

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, adminNotes } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update the database record
    const odometerCollection = await getEmployeeCollection('odometer_readings');
    const result = await odometerCollection.updateOne(
      { id },
      { 
        $set: { 
          status, 
          adminNotes: adminNotes || null,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Odometer reading not found' },
        { status: 404 }
      );
    }

    console.log('Updated odometer reading status:', { id, status, adminNotes });

    const updatedReading = {
      id,
      status,
      adminNotes,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedReading);
  } catch (error) {
    console.error('Error updating odometer status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
