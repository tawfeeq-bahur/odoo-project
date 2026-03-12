import { NextRequest, NextResponse } from 'next/server';
import { getDestinationAttractions } from '@/ai/flows/attractions';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await getDestinationAttractions(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[API] attractions error:', error);
        return NextResponse.json(
            { error: 'Failed to get attractions' },
            { status: 500 }
        );
    }
}
