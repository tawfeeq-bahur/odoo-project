import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/postgresql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');
    const userId = searchParams.get('userId');

    let result;
    if (tourId) {
      // Get all participants for a specific tour
      result = await query(`
        SELECT tp.*, u.name as user_name, u.email, u.role
        FROM tour_participants tp
        JOIN users u ON tp.user_id = u.id
        JOIN tour_plans t ON tp.tour_id = t.id
        WHERE t.tour_id = $1
        ORDER BY tp.registration_date DESC
      `, [tourId]);
    } else if (userId) {
      // Get all tours a user has registered for
      result = await query(`
        SELECT tp.*, t.tour_name, t.start_date, t.end_date, t.status as tour_status
        FROM tour_participants tp
        JOIN tour_plans t ON tp.tour_id = t.id
        WHERE tp.user_id = $1
        ORDER BY tp.registration_date DESC
      `, [userId]);
    } else {
      // Get all participants
      result = await query(`
        SELECT tp.*, u.name as user_name, u.email, t.tour_name
        FROM tour_participants tp
        JOIN users u ON tp.user_id = u.id
        JOIN tour_plans t ON tp.tour_id = t.id
        ORDER BY tp.registration_date DESC
      `);
    }

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching tour participants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tour participants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tour_id,
      user_id,
      payment_status,
      payment_amount,
      special_requirements,
      emergency_contact_name,
      emergency_contact_phone
    } = body;

    const result = await transaction(async (client) => {
      // Check if user is already registered for this tour
      const existingRegistration = await client.query(`
        SELECT tp.id FROM tour_participants tp
        JOIN tour_plans t ON tp.tour_id = t.id
        WHERE t.tour_id = $1 AND tp.user_id = $2
      `, [tour_id, user_id]);

      if (existingRegistration.rows.length > 0) {
        throw new Error('User is already registered for this tour');
      }

      // Get the tour plan ID
      const tourResult = await client.query(
        'SELECT id, max_participants, current_participants FROM tour_plans WHERE tour_id = $1',
        [tour_id]
      );

      if (tourResult.rows.length === 0) {
        throw new Error('Tour not found');
      }

      const tour = tourResult.rows[0];

      // Check if tour is full
      if (tour.current_participants >= tour.max_participants) {
        throw new Error('Tour is full');
      }

      // Register the participant
      const participantResult = await client.query(`
        INSERT INTO tour_participants (
          tour_id, user_id, payment_status, payment_amount,
          special_requirements, emergency_contact_name, emergency_contact_phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        tour.id, user_id, payment_status, payment_amount,
        special_requirements, emergency_contact_name, emergency_contact_phone
      ]);

      // Update tour participant count
      await client.query(`
        UPDATE tour_plans 
        SET current_participants = current_participants + 1
        WHERE id = $1
      `, [tour.id]);

      return participantResult.rows[0];
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error registering for tour:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register for tour' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await query(`
      UPDATE tour_participants 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `, [id, ...values]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating tour participant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tour participant' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    const result = await transaction(async (client) => {
      // Get participant details
      const participantResult = await client.query(`
        SELECT tp.tour_id, t.tour_id as tour_identifier
        FROM tour_participants tp
        JOIN tour_plans t ON tp.tour_id = t.id
        WHERE tp.id = $1
      `, [participantId]);

      if (participantResult.rows.length === 0) {
        throw new Error('Participant not found');
      }

      const participant = participantResult.rows[0];

      // Delete the participant
      await client.query('DELETE FROM tour_participants WHERE id = $1', [participantId]);

      // Update tour participant count
      await client.query(`
        UPDATE tour_plans 
        SET current_participants = current_participants - 1
        WHERE id = $1
      `, [participant.tour_id]);

      return participant.tour_identifier;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully unregistered from tour ${result}`
    });
  } catch (error) {
    console.error('Error unregistering from tour:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to unregister from tour' },
      { status: 500 }
    );
  }
}
