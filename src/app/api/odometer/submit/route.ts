import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { OdometerReading } from '@/lib/types';
import { getEmployeeCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const photo = formData.get('photo') as File;
    const odometerValue = formData.get('odometerValue') as string;
    const vehicleId = formData.get('vehicleId') as string;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);
    const timestamp = formData.get('timestamp') as string;
    const tripId = formData.get('tripId') as string | null;
    const exifDataStr = formData.get('exifData') as string | null;

    // Validate required fields
    if (!photo || !odometerValue || !vehicleId || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'odometer');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const fileExtension = photo.name.split('.').pop() || 'jpg';
    const filename = `${uuidv4()}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create odometer reading record
    const reading: OdometerReading = {
      id: uuidv4(),
      driverId: 'current-user', // This should come from auth context
      vehicleId,
      tripId: tripId || undefined,
      odometerValue: parseInt(odometerValue),
      photoUrl: `/uploads/odometer/${filename}`,
      latitude,
      longitude,
      timestamp,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      exifData: exifDataStr ? JSON.parse(exifDataStr) : undefined,
    };

    // Save to employee database
    const odometerCollection = await getEmployeeCollection<OdometerReading>('odometer_readings');
    const result = await odometerCollection.insertOne(reading);
    
    console.log('Odometer reading saved to database:', result.insertedId);

    return NextResponse.json({ ...reading, _id: result.insertedId });
  } catch (error) {
    console.error('Error processing odometer submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
