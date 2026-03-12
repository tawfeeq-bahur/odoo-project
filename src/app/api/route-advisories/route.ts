import { NextRequest, NextResponse } from 'next/server';
import { getAdminCollection } from '@/lib/mongodb';

export interface RouteAdvisory {
  _id?: any;
  type: 'political_rally' | 'festival' | 'road_block' | 'construction' | 'weather' | 'traffic_peak' | 'best_time';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedAreas: string[];      // city/locality names
  affectedStreets?: string[];   // specific road/street names
  startDate: string;            // ISO date
  endDate: string;              // ISO date
  timeSlot?: string;            // e.g. "06:00-10:00"
  recommendation: string;       // what to do instead
  source?: string;              // where this info came from
  isActive: boolean;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination')?.toLowerCase().trim();
    const source = searchParams.get('source')?.toLowerCase().trim();
    const date = searchParams.get('date'); // optional: filter by a specific travel date

    const collection = await getAdminCollection<RouteAdvisory>('route_advisories');

    // Build filter
    const filter: any = { isActive: true };

    // Match advisories where destination/source matches any affected area
    const locationTerms: string[] = [];
    if (destination) locationTerms.push(destination);
    if (source) locationTerms.push(source);

    if (locationTerms.length > 0) {
      // Case-insensitive regex match on affectedAreas array
      filter.affectedAreas = {
        $elemMatch: {
          $regex: locationTerms.join('|'),
          $options: 'i'
        }
      };
    }

    // If travel date given, filter advisories active during that date
    if (date) {
      filter.startDate = { $lte: date };
      filter.endDate = { $gte: date };
    }

    const advisories = await collection
      .find(filter)
      .sort({ severity: 1, startDate: 1 })
      .toArray();

    // Also fetch "best time to travel" info for these routes
    const bestTimeFilter: any = {
      isActive: true,
      type: 'best_time'
    };
    if (locationTerms.length > 0) {
      bestTimeFilter.affectedAreas = {
        $elemMatch: {
          $regex: locationTerms.join('|'),
          $options: 'i'
        }
      };
    }
    const bestTimes = await collection
      .find(bestTimeFilter)
      .toArray();

    // Merge (deduplicate)
    const allIds = new Set(advisories.map(a => a._id?.toString()));
    for (const bt of bestTimes) {
      if (!allIds.has(bt._id?.toString())) {
        advisories.push(bt);
      }
    }

    return NextResponse.json({
      success: true,
      data: advisories,
      count: advisories.length
    });
  } catch (error) {
    console.error('Error fetching route advisories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch route advisories' },
      { status: 500 }
    );
  }
}

// POST — Admin creates a new advisory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const advisory: RouteAdvisory = {
      type: body.type,
      severity: body.severity || 'warning',
      title: body.title,
      description: body.description,
      affectedAreas: (body.affectedAreas || []).map((a: string) => a.toLowerCase().trim()),
      affectedStreets: body.affectedStreets || [],
      startDate: body.startDate,
      endDate: body.endDate,
      timeSlot: body.timeSlot || null,
      recommendation: body.recommendation,
      source: body.source || 'admin',
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
    };

    const collection = await getAdminCollection<RouteAdvisory>('route_advisories');
    const result = await collection.insertOne(advisory as any);

    return NextResponse.json({
      success: true,
      data: { ...advisory, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating route advisory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create route advisory' },
      { status: 500 }
    );
  }
}
