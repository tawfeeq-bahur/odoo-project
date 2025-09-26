import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/postgresql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');
    const organizerId = searchParams.get('organizerId');

    let result;
    if (tourId) {
      // Get specific tour with destinations
      const tourResult = await query(
        'SELECT * FROM tour_plans WHERE tour_id = $1',
        [tourId]
      );
      
      if (tourResult.rows.length > 0) {
        const destinationsResult = await query(
          'SELECT * FROM tour_destinations WHERE tour_id = $1 ORDER BY order_sequence',
          [tourResult.rows[0].id]
        );
        
        const participantsResult = await query(
          'SELECT tp.*, u.name as user_name, u.email FROM tour_participants tp JOIN users u ON tp.user_id = u.id WHERE tp.tour_id = $1',
          [tourResult.rows[0].id]
        );

        result = {
          ...tourResult.rows[0],
          destinations: destinationsResult.rows,
          participants: participantsResult.rows
        };
      } else {
        result = null;
      }
    } else if (organizerId) {
      // Get all tours for an organizer
      result = await query(
        'SELECT * FROM tour_plans WHERE organizer_id = $1 ORDER BY created_at DESC',
        [organizerId]
      );
    } else {
      // Get all tours
      result = await query(
        'SELECT * FROM tour_plans ORDER BY created_at DESC'
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tours' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tour_id,
      tour_name,
      description,
      start_date,
      end_date,
      duration_days,
      max_participants,
      price_per_person,
      total_budget,
      organizer_id,
      destinations
    } = body;

    const result = await transaction(async (client) => {
      // Create tour plan
      const tourResult = await client.query(`
        INSERT INTO tour_plans (
          tour_id, tour_name, description, start_date, end_date, duration_days,
          max_participants, price_per_person, total_budget, organizer_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        tour_id, tour_name, description, start_date, end_date, duration_days,
        max_participants, price_per_person, total_budget, organizer_id
      ]);

      const tour = tourResult.rows[0];

      // Add destinations if provided
      if (destinations && destinations.length > 0) {
        for (const dest of destinations) {
          await client.query(`
            INSERT INTO tour_destinations (
              tour_id, destination_name, latitude, longitude, visit_date, visit_time,
              duration_hours, cost, description, order_sequence
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            tour.id, dest.destination_name, dest.latitude, dest.longitude,
            dest.visit_date, dest.visit_time, dest.duration_hours, dest.cost,
            dest.description, dest.order_sequence
          ]);
        }
      }

      return tour;
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tour' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tour_id, ...updateData } = body;

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await query(`
      UPDATE tour_plans 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE tour_id = $1
      RETURNING *
    `, [tour_id, ...values]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating tour:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tour' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');

    if (!tourId) {
      return NextResponse.json(
        { success: false, error: 'Tour ID is required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM tour_plans WHERE tour_id = $1', [tourId]);

    return NextResponse.json({
      success: true,
      message: 'Tour deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tour' },
      { status: 500 }
    );
  }
}
