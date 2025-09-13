import { NextResponse } from 'next/server'
import { getAdminCollection } from '@/lib/mongodb'

interface Admin {
  _id?: any;
  username: string;
  password: string;
  role: string;
  createdAt: Date;
  note?: string;
  [key: string]: any;
}

export async function POST(request: Request) {
  try {
    const admins = await getAdminCollection<Admin>('admins')
    
    // Check if admin already exists
    const existingAdmin = await admins.findOne({ username: 'admin' })
    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user already exists',
        data: {
          username: existingAdmin.username,
          role: existingAdmin.role,
          createdAt: existingAdmin.createdAt
        }
      })
    }

    // Create admin user
    const adminDoc = {
      username: 'admin',
      password: '123',
      role: 'admin',
      createdAt: new Date(),
      note: 'Default admin user created',
    }
    
    const result = await admins.insertOne(adminDoc)

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      data: {
        username: adminDoc.username,
        role: adminDoc.role,
        createdAt: adminDoc.createdAt,
        id: result.insertedId
      }
    })
  } catch (err: any) {
    console.error('Error creating admin user:', err)
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const admins = await getAdminCollection<Admin>('admins')
    const admin = await admins.findOne({ username: 'admin' })
    
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Admin user not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        username: admin.username,
        role: admin.role,
        createdAt: admin.createdAt
      }
    })
  } catch (err: any) {
    console.error('Error fetching admin user:', err)
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
