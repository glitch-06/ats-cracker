import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Convert a hex-encoded HMAC-SHA256 signature check using Web Crypto
async function verifySignature(orderId: string, paymentId: string, signature: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${orderId}|${paymentId}`),
  );
  const generated = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return generated === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const valid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the order + pack
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, credit_packs(credits)")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", userId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.status === "paid") {
      return new Response(JSON.stringify({ success: true, alreadyProcessed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark order paid
    await supabase
      .from("orders")
      .update({ status: "paid", razorpay_payment_id })
      .eq("id", order.id);

    // Add credits to profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("free_uses_remaining")
      .eq("id", userId)
      .single();

    const creditsToAdd = order.credit_packs?.credits ?? 0;

    await supabase
      .from("profiles")
      .update({ free_uses_remaining: (profile?.free_uses_remaining ?? 0) + creditsToAdd })
      .eq("id", userId);

    return new Response(JSON.stringify({ success: true, creditsAdded: creditsToAdd }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});