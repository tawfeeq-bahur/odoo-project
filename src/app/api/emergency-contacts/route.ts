import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgresql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactType = searchParams.get('type');
    const serviceArea = searchParams.get('area');
    const isActive = searchParams.get('active');

    let queryText = 'SELECT * FROM emergency_contacts WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (contactType) {
      queryText += ` AND contact_type = $${paramIndex}`;
      params.push(contactType);
      paramIndex++;
    }

    if (serviceArea) {
      queryText += ` AND service_area ILIKE $${paramIndex}`;
      params.push(`%${serviceArea}%`);
      paramIndex++;
    }

    if (isActive !== null) {
      queryText += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    queryText += ' ORDER BY priority ASC, name ASC';

    const result = await query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch emergency contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contact_id,
      name,
      phone,
      email,
      contact_type,
      service_area,
      latitude,
      longitude,
      address,
      is_24_7,
      priority,
      is_active
    } = body;

    const result = await query(`
      INSERT INTO emergency_contacts (
        contact_id, name, phone, email, contact_type, service_area,
        latitude, longitude, address, is_24_7, priority, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      contact_id, name, phone, email, contact_type, service_area,
      latitude, longitude, address, is_24_7, priority, is_active
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating emergency contact:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create emergency contact' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact_id, ...updateData } = body;

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await query(`
      UPDATE emergency_contacts 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE contact_id = $1
      RETURNING *
    `, [contact_id, ...values]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update emergency contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM emergency_contacts WHERE contact_id = $1', [contactId]);

    return NextResponse.json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete emergency contact' },
      { status: 500 }
    );
  }
}
