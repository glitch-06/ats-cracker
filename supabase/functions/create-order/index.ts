import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { packId } = await req.json();

    const { data: pack, error: packErr } = await supabase
      .from("credit_packs")
      .select("*")
      .eq("id", packId)
      .eq("active", true)
      .single();

    if (packErr || !pack) {
      return new Response(JSON.stringify({ error: "Invalid pack" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: pack.price_inr * 100, // paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
      }),
    });

    if (!rpRes.ok) {
      const errText = await rpRes.text();
      throw new Error(`Razorpay error: ${errText}`);
    }

    const rpOrder = await rpRes.json();

    // Save order in our DB
    const { error: insertErr } = await supabase.from("orders").insert({
      user_id: userId,
      pack_id: pack.id,
      razorpay_order_id: rpOrder.id,
      status: "created",
    });
    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({
        orderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        keyId: RAZORPAY_KEY_ID,
        packName: pack.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});