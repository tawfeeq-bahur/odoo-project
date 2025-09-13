import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeCollection } from '@/lib/mongodb';
import { EmployeeProfile } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const employees = await getEmployeeCollection<EmployeeProfile>('employee_profiles');
    const employee = await employees.findOne({ employeeId });
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee profile:', error);
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
    if (!body.name || !body.employeeId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, employeeId' },
        { status: 400 }
      );
    }

    const employee: EmployeeProfile = {
      id: body.id || `emp_${Date.now()}`,
      name: body.name,
      employeeId: body.employeeId,
      email: body.email || undefined,
      phone: body.phone || undefined,
      department: body.department || undefined,
      position: body.position || undefined,
      assignedVehicleId: body.assignedVehicleId || null,
      emergencyContacts: body.emergencyContacts || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const employees = await getEmployeeCollection<EmployeeProfile>('employee_profiles');
    const result = await employees.insertOne(employee);
    
    return NextResponse.json({ 
      success: true, 
      employee: { ...employee, _id: result.insertedId },
      message: 'Employee profile created successfully' 
    });
  } catch (error) {
    console.error('Error creating employee profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const employees = await getEmployeeCollection<EmployeeProfile>('employee_profiles');
    const result = await employees.updateOne(
      { employeeId: body.employeeId },
      { 
        $set: { 
          ...body, 
          updatedAt: new Date().toISOString() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Employee profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
