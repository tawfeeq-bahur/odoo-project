import { NextRequest, NextResponse } from 'next/server'
import { getAdminCollection } from '@/lib/mongodb'

export async function DELETE(request: NextRequest) {
  try {
    const routes = await getAdminCollection('routes')
    
    // Delete all routes from the collection
    const result = await routes.deleteMany({})
    
    console.log(`🗑️ Deleted ${result.deletedCount} routes from database`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} routes`,
      deletedCount: result.deletedCount
    })

  } catch (error) {
    console.error('Error deleting routes:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete routes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
