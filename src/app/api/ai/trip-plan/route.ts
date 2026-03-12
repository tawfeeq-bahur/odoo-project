import { NextRequest, NextResponse } from 'next/server';
import { getTripPlan } from '@/ai/flows/trip-planner';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await getTripPlan(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[API] trip-plan error:', error);
        return NextResponse.json(
            { error: 'Failed to generate trip plan' },
            { status: 500 }
        );
    }
}
