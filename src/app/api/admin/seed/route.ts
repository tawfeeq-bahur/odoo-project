import { NextResponse } from 'next/server'
import { getAdminCollection } from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as any))

    const admins = await getAdminCollection('admins')
    const doc = {
      username: body.username || 'admin',
      role: 'admin',
      createdAt: new Date(),
      note: 'Seeded via /api/admin/seed',
    }
    const result = await admins.insertOne(doc)

    return NextResponse.json({ ok: true, insertedId: result.insertedId, db: process.env.MONGODB_DB_ADMIN || 'fleet_admin' })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

export async function GET() {
  // Simple health check for the admin DB
  const admins = await getAdminCollection('admins')
  const count = await admins.countDocuments({})
  return NextResponse.json({ ok: true, db: process.env.MONGODB_DB_ADMIN || 'fleet_admin', count })
}



