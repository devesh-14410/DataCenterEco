import { NextResponse } from 'next/server';

let latestTelemetryData = {
  status: "No active nodes streaming",
  last_updated: null
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { auth_key, node_id, metrics } = body;

    if (auth_key !== "sk_live_ecovolt_94820") {
      return NextResponse.json({ error: "Unauthorized Secure Channel" }, { status: 401 });
    }

    latestTelemetryData = {
      node_id: node_id,
      hardware_type: body.hardware_type,
      metrics: metrics,
      last_updated: new Date().toISOString()
    };

    return NextResponse.json({ message: "Telemetry pipeline synchronized", status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Internal Pipeline Ingestion Failure" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(latestTelemetryData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
