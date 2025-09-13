import { NextRequest, NextResponse } from 'next/server'
import { getAdminCollection } from '@/lib/mongodb'

interface Route {
  _id?: any;
  source: string;
  destination: string;
  date: string;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const routes = await getAdminCollection<Route>('routes')
    
    // First, let's get all routes to debug
    const allRoutes = await routes.find({}).toArray()
    console.log('Total routes found:', allRoutes.length)
    console.log('All routes:', allRoutes.map(r => ({ 
      id: r._id, 
      source: r.source, 
      destination: r.destination, 
      date: r.date 
    })))
    
    // Get the last route assigned by admin (most recent by date)
    const lastRoute = await routes.findOne(
      {},
      { sort: { date: -1 } }
    )

    console.log('Last route found:', lastRoute)

    if (!lastRoute) {
      return NextResponse.json({ 
        success: false, 
        message: 'No routes found',
        debug: {
          totalRoutes: allRoutes.length,
          allRoutes: allRoutes.map(r => ({ 
            id: r._id, 
            source: r.source, 
            destination: r.destination, 
            date: r.date 
          }))
        }
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: lastRoute,
      message: 'Last route retrieved successfully',
      debug: {
        totalRoutes: allRoutes.length,
        selectedRoute: {
          id: lastRoute._id,
          source: lastRoute.source,
          destination: lastRoute.destination,
          date: lastRoute.date
        }
      }
    })

  } catch (error) {
    console.error('Error fetching last route:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch last route',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
