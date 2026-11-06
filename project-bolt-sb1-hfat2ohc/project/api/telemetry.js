
let latestTelemetryData = {
  status: "No active nodes streaming",
  last_updated: null
};

export default async function handler(req, res) {

 // GET: Return latest available hardware telemetry
if (req.method === "GET") {
  return res.status(200).json(latestTelemetryData);
}

  // Only POST requests can send telemetry
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {
    const body = req.body;
    const secret = process.env.TELEMETRY_SECRET;

    if (!secret) {
      return res.status(500).json({
        error: "Server secret not configured"
      });
    }

    if (body.auth_key !== secret) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    if (!body.node_id || !body.metrics) {
      return res.status(400).json({
        error: "Missing telemetry data"
      });
    }

    latestTelemetryData = {
      node_id: body.node_id,
      hardware_type: body.hardware_type,
      metrics: body.metrics,
      last_updated: new Date().toISOString()
    };

    return res.status(200).json({
      message: "Telemetry received successfully",
      status: 200
    });

  } catch (error) {
    return res.status(500).json({
      error: "Telemetry ingestion failed"
    });
  }
}
