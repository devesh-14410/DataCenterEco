
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

// Verify the hardware agent's secret securely
function verifySecret(provided, expected) {
  if (
    typeof provided !== "string" ||
    typeof expected !== "string"
  ) {
    return false;
  }

  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

// Create a secure server-side Supabase client
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Supabase environment variables are missing");
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  // Allow GET and POST only
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {
    // GET: Retrieve the latest telemetry from Supabase
    if (req.method === "GET") {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("telemetry_readings")
        .select("node_id, hardware_type, metrics, recorded_at")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Telemetry read failed:", error.message);

        return res.status(500).json({
          error: "Unable to retrieve telemetry"
        });
      }

      if (!data) {
        return res.status(200).json({
          status: "No active nodes streaming",
          last_updated: null
        });
      }

      return res.status(200).json({
        node_id: data.node_id,
        hardware_type: data.hardware_type,
        metrics: data.metrics,
        last_updated: data.recorded_at
      });
    }

    // POST: Receive telemetry from the hardware agent
    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          error: "Invalid JSON payload"
        });
      }
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        error: "Invalid telemetry payload"
      });
    }

    // Authenticate the hardware agent
    const expectedSecret = process.env.TELEMETRY_SECRET;

    if (!expectedSecret) {
      return res.status(500).json({
        error: "Server authentication is not configured"
      });
    }

    if (!verifySecret(body.auth_key, expectedSecret)) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    // Validate telemetry data
    if (
      typeof body.node_id !== "string" ||
      !body.node_id.trim() ||
      !body.metrics ||
      typeof body.metrics !== "object" ||
      Array.isArray(body.metrics)
    ) {
      return res.status(400).json({
        error: "Missing or invalid telemetry data"
      });
    }

    const supabase = getSupabaseClient();

    // Permanently insert the telemetry reading
    const { data, error } = await supabase
      .from("telemetry_readings")
      .insert({
        node_id: body.node_id.trim(),

        site_id:
          typeof body.site_id === "string"
            ? body.site_id
            : null,

        facility_type:
          typeof body.facility_type === "string"
            ? body.facility_type
            : "compute_node",

        hardware_type:
          typeof body.hardware_type === "string"
            ? body.hardware_type
            : null,

        metrics: body.metrics
      })
      .select("node_id, hardware_type, recorded_at")
      .single();

    if (error) {
      console.error("Telemetry insert failed:", error.message);

      return res.status(500).json({
        error: "Failed to save telemetry"
      });
    }

    return res.status(200).json({
      message: "Telemetry saved successfully",
      status: 200,
      node_id: data.node_id,
      last_updated: data.recorded_at
    });

  } catch (error) {
    console.error("Telemetry API error:", error.message);

    return res.status(500).json({
      error: "Telemetry service unavailable"
    });
  }
}
