import { NextResponse } from 'next/server'
import { getEmployeeCollection } from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as any))

    const employees = await getEmployeeCollection('employees')
    const doc = {
      name: body.name || 'John Doe',
      employeeId: body.employeeId || 'EMP001',
      assignedVehicleId: body.assignedVehicleId || null,
      createdAt: new Date(),
      note: 'Seeded via /api/employee/seed',
    }
    const result = await employees.insertOne(doc)

    return NextResponse.json({ ok: true, insertedId: result.insertedId, db: process.env.MONGODB_DB_EMPLOYEE || 'fleet_employee' })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

export async function GET() {
  // Simple health check for the employee DB
  const employees = await getEmployeeCollection('employees')
  const count = await employees.countDocuments({})
  return NextResponse.json({ ok: true, db: process.env.MONGODB_DB_EMPLOYEE || 'fleet_employee', count })
}



