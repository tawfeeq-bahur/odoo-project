import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeCollection } from '@/lib/mongodb';
import { EmployeeProfile } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const employees = await getEmployeeCollection<EmployeeProfile>('employees');
    const allEmployees = await employees.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ 
      success: true, 
      data: allEmployees,
      count: allEmployees.length 
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
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
      id: `emp_${Date.now()}`,
      name: body.name,
      employeeId: body.employeeId,
      email: body.email || '',
      phone: body.phone || '',
      department: body.department || '',
      position: body.position || '',
      assignedVehicleId: body.assignedVehicleId || null,
      emergencyContacts: body.emergencyContacts || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const employees = await getEmployeeCollection<EmployeeProfile>('employees');
    const result = await employees.insertOne(employee);
    
    return NextResponse.json({ 
      success: true, 
      employee: { ...employee, _id: result.insertedId },
      message: 'Employee created successfully' 
    });
  } catch (error) {
    console.error('Error creating employee:', error);
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
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const employees = await getEmployeeCollection<EmployeeProfile>('employees');
    const result = await employees.updateOne(
      { id: body.id },
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
      message: 'Employee updated successfully' 
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const employees = await getEmployeeCollection<EmployeeProfile>('employees');
    const result = await employees.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Employee deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
