import { NextRequest, NextResponse } from 'next/server';
import { getAdminCollection, getEmployeeCollection, adminDbPromise, employeeDbPromise } from '@/lib/mongodb';

interface TestDoc {
  test: boolean;
  timestamp: Date;
  message: string;
}

export async function GET(request: NextRequest) {
  try {
    const results = {
      adminDb: { connected: false, collections: [] as string[], error: null as string | null },
      employeeDb: { connected: false, collections: [] as string[], error: null as string | null },
      timestamp: new Date().toISOString()
    };

    // Test Admin Database Connection
    try {
      const adminDb = await adminDbPromise;
      const adminCollections = await adminDb.listCollections().toArray();
      results.adminDb.connected = true;
      results.adminDb.collections = adminCollections.map(col => col.name);
    } catch (error) {
      results.adminDb.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test Employee Database Connection
    try {
      const employeeDb = await employeeDbPromise;
      const employeeCollections = await employeeDb.listCollections().toArray();
      results.employeeDb.connected = true;
      results.employeeDb.collections = employeeCollections.map(col => col.name);
    } catch (error) {
      results.employeeDb.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test basic operations
    try {
      const testAdminCollection = await getAdminCollection<TestDoc>('connection_test');
      await testAdminCollection.insertOne({ 
        test: true, 
        timestamp: new Date(),
        message: 'Admin DB write test successful' 
      });
      await testAdminCollection.deleteMany({ test: true });
    } catch (error) {
      results.adminDb.error = results.adminDb.error || `Write test failed: ${error}`;
    }

    try {
      const testEmployeeCollection = await getEmployeeCollection<TestDoc>('connection_test');
      await testEmployeeCollection.insertOne({ 
        test: true, 
        timestamp: new Date(),
        message: 'Employee DB write test successful' 
      });
      await testEmployeeCollection.deleteMany({ test: true });
    } catch (error) {
      results.employeeDb.error = results.employeeDb.error || `Write test failed: ${error}`;
    }

    const allConnected = results.adminDb.connected && results.employeeDb.connected;
    
    return NextResponse.json({
      success: allConnected,
      message: allConnected 
        ? 'Both databases connected successfully' 
        : 'One or more database connections failed',
      results
    });

  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
