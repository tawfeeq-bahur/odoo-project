import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeCollection } from '@/lib/mongodb';
import { Expense } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const tripId = searchParams.get('tripId');

    // Build filter query
    const filter: any = {};
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    if (status) {
      filter.status = status;
    }
    if (tripId) {
      filter.tripId = tripId;
    }

    const expenses = await getEmployeeCollection<Expense>('expenses');
    const allExpenses = await expenses.find(filter).sort({ date: -1 }).toArray();
    
    return NextResponse.json(allExpenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
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
    if (!body.type || !body.amount || !body.date || !body.employeeId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, date, employeeId' },
        { status: 400 }
      );
    }

    const expense: Expense & { employeeId: string } = {
      id: body.id || `expense_${Date.now()}`,
      type: body.type,
      amount: parseFloat(body.amount),
      date: body.date,
      tripId: body.tripId || undefined,
      status: 'pending',
      employeeId: body.employeeId,
    };

    const expenses = await getEmployeeCollection<Expense & { employeeId: string }>('expenses');
    const result = await expenses.insertOne(expense);
    
    return NextResponse.json({ 
      success: true, 
      expense: { ...expense, _id: result.insertedId },
      message: 'Expense submitted successfully' 
    });
  } catch (error) {
    console.error('Error creating expense:', error);
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
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    const expenses = await getEmployeeCollection<Expense>('expenses');
    const result = await expenses.updateOne(
      { id: body.id },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Expense updated successfully' 
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
