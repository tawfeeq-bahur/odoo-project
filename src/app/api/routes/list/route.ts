import { NextRequest, NextResponse } from 'next/server'
import { getAdminCollection } from '@/lib/mongodb'

interface Route {
  _id?: any;
  source: string;
  destination: string;
  date: string;
  distance: number;
  emissions: number;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const routes = await getAdminCollection<Route>('routes')
    
    // Get all routes, sorted by date (most recent first)
    const allRoutes = await routes.find({}).sort({ date: -1 }).toArray()
    
    console.log('Total routes found:', allRoutes.length)
    console.log('All routes:', allRoutes.map(r => ({ 
      id: r._id, 
      source: r.source, 
      destination: r.destination, 
      date: r.date,
      distance: r.distance,
      emissions: r.emissions
    })))

    return NextResponse.json({
      success: true,
      data: allRoutes,
      message: `Retrieved ${allRoutes.length} routes successfully`,
      count: allRoutes.length
    })

  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch routes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
