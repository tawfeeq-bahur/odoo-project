import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/postgresql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const planId = searchParams.get('planId');

    let result;
    if (planId) {
      // Get specific route plan
      result = await query(
        'SELECT * FROM route_plans WHERE plan_id = $1',
        [planId]
      );
    } else if (userId) {
      // Get all route plans for a user
      result = await query(
        'SELECT * FROM route_plans WHERE created_by = $1 ORDER BY created_at DESC',
        [userId]
      );
    } else {
      // Get all route plans
      result = await query(
        'SELECT * FROM route_plans ORDER BY created_at DESC'
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching route plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch route plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      plan_id,
      source,
      destination,
      source_lat,
      source_lng,
      dest_lat,
      dest_lng,
      distance_km,
      estimated_time_minutes,
      route_polyline,
      traffic_condition,
      weather_condition,
      fuel_cost,
      toll_cost,
      total_cost,
      created_by
    } = body;

    const result = await query(`
      INSERT INTO route_plans (
        plan_id, source, destination, source_lat, source_lng, dest_lat, dest_lng,
        distance_km, estimated_time_minutes, route_polyline, traffic_condition,
        weather_condition, fuel_cost, toll_cost, total_cost, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      plan_id, source, destination, source_lat, source_lng, dest_lat, dest_lng,
      distance_km, estimated_time_minutes, route_polyline, traffic_condition,
      weather_condition, fuel_cost, toll_cost, total_cost, created_by
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating route plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create route plan' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan_id, ...updateData } = body;

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await query(`
      UPDATE route_plans 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE plan_id = $1
      RETURNING *
    `, [plan_id, ...values]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating route plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update route plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json(
        { success: false, error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM route_plans WHERE plan_id = $1', [planId]);

    return NextResponse.json({
      success: true,
      message: 'Route plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting route plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete route plan' },
      { status: 500 }
    );
  }
}
