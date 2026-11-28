import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

function verifySecret(provided, expected) {
  if (typeof provided !== "string" || typeof expected !== "string") return false;
  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer);
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("Supabase environment variables are missing");
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
}

function bearerToken(req) {
  const value = req.headers.authorization || "";
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const supabase = getSupabaseClient();

    if (req.method === "GET") {
      const token = bearerToken(req);
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData.user) {
        return res.status(401).json({ error: "Invalid or expired session" });
      }

      let query = supabase
        .from("telemetry_readings")
        .select("node_id, hardware_type, metrics, recorded_at")
        .order("recorded_at", { ascending: false })
        .limit(1);

      if (authData.user.app_metadata?.role !== "admin") {
        const { data: account, error: accountError } = await supabase
          .from("customer_accounts")
          .select("account_id")
          .eq("user_id", authData.user.id)
          .maybeSingle();

        if (accountError) {
          console.error("Customer account lookup failed:", accountError.message);
          return res.status(500).json({ error: "Unable to resolve customer account" });
        }
        if (!account) return res.status(403).json({ error: "Customer account is not provisioned" });

        query = query.eq("account_id", account.account_id);
      }

      const { data, error } = await query.maybeSingle();
      if (error) {
        console.error("Telemetry read failed:", error.message);
        return res.status(500).json({ error: "Unable to retrieve telemetry" });
      }

      if (!data) {
        return res.status(200).json({ status: "No telemetry assigned to this account", last_updated: null });
      }

      return res.status(200).json({
        node_id: data.node_id,
        hardware_type: data.hardware_type,
        metrics: data.metrics,
        last_updated: data.recorded_at
      });
    }

    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); }
      catch { return res.status(400).json({ error: "Invalid JSON payload" }); }
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "Invalid telemetry payload" });
    }

    const expectedSecret = process.env.TELEMETRY_SECRET;
    if (!expectedSecret) return res.status(500).json({ error: "Server authentication is not configured" });
    if (!verifySecret(body.auth_key, expectedSecret)) return res.status(401).json({ error: "Unauthorized" });

    if (
      typeof body.node_id !== "string" || !body.node_id.trim() ||
      !body.metrics || typeof body.metrics !== "object" || Array.isArray(body.metrics)
    ) {
      return res.status(400).json({ error: "Missing or invalid telemetry data" });
    }

    const { data, error } = await supabase
      .from("telemetry_readings")
      .insert({
        node_id: body.node_id.trim(),
        site_id: typeof body.site_id === "string" ? body.site_id : null,
        facility_type: typeof body.facility_type === "string" ? body.facility_type : "compute_node",
        hardware_type: typeof body.hardware_type === "string" ? body.hardware_type : null,
        metrics: body.metrics
      })
      .select("node_id, hardware_type, recorded_at")
      .single();

    if (error) {
      console.error("Telemetry insert failed:", error.message);
      return res.status(500).json({ error: "Failed to save telemetry" });
    }

    return res.status(200).json({
      message: "Telemetry saved successfully",
      status: 200,
      node_id: data.node_id,
      last_updated: data.recorded_at
    });
  } catch (error) {
    console.error("Telemetry API error:", error.message);
    return res.status(500).json({ error: "Telemetry service unavailable" });
  }
}
