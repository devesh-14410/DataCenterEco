import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("Supabase environment variables are missing");
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const authorization = req.headers.authorization || "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: "Authentication required" });

    const supabase = getSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.getUser(match[1]);
    if (authError || !authData.user) return res.status(401).json({ error: "Invalid or expired session" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const nodeId = typeof body?.node_id === "string" ? body.node_id.trim() : "";
    if (!nodeId || nodeId.length > 128) {
      return res.status(400).json({ error: "A valid node_id (1–128 characters) is required" });
    }

    const { data: account, error: accountError } = await supabase
      .from("customer_accounts")
      .select("account_id")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (accountError || !account) {
      return res.status(403).json({ error: "Customer account is not provisioned" });
    }

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { error: insertError } = await supabase
      .from("agent_credentials")
      .insert({
        account_id: account.account_id,
        node_id: nodeId,
        token_hash: tokenHash,
        token_prefix: token.slice(0, 8)
      });

    if (insertError) {
      console.error("Agent credential creation failed:", insertError.message);
      return res.status(500).json({ error: "Unable to create agent credential" });
    }

    return res.status(201).json({
      node_id: nodeId,
      agent_token: token,
      warning: "Copy this token now. It will not be shown again."
    });
  } catch (error) {
    console.error("Agent credential API error:", error.message);
    return res.status(500).json({ error: "Unable to create agent credential" });
  }
}
