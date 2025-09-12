import { NextRequest, NextResponse } from 'next/server'
import { getAdminCollection } from '@/lib/mongodb'

type SaveRouteBody = {
  source: string
  destination: string
  vehicleType: string
  vehicleYear?: number
  distance: number
  emissions: number
  routeSource?: string
  fuelType?: string
  modelYear?: number
  routeType?: string
  traffic?: string
  claimedEfficiency?: number
  claimedEfficiencyUnit?: string
  electricitySource?: string
  ecoTip?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SaveRouteBody>

    if (!body.source || !body.destination || !body.vehicleType || body.distance == null || body.emissions == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const col = await getAdminCollection('routes')
    const doc = {
      source: body.source,
      destination: body.destination,
      vehicleType: body.vehicleType,
      vehicleYear: body.vehicleYear ?? body.modelYear ?? null,
      fuelType: body.fuelType ?? null,
      distance: Number(body.distance),
      emissions: Number(body.emissions),
      routeSource: typeof body.routeSource === 'string' ? body.routeSource : 'OSM',
      routeType: body.routeType ?? null,
      traffic: body.traffic ?? null,
      claimedEfficiency: body.claimedEfficiency ?? null,
      claimedEfficiencyUnit: body.claimedEfficiencyUnit ?? null,
      electricitySource: body.electricitySource ?? null,
      ecoTip: body.ecoTip ?? null,
      date: new Date(),
    }

    const result = await col.insertOne(doc)
    return NextResponse.json({ ok: true, id: result.insertedId, data: doc })
  } catch (err) {
    console.error('save route error', err)
    return NextResponse.json({ error: 'Failed to save route' }, { status: 500 })
  }
}


