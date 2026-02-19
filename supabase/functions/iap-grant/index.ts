import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// SKU → 유효 기간(일)
const SKU_DURATION_DAYS: Record<string, number> = {
  focus_valley_pro_1m: 30,
  focus_valley_pro_3m: 90,
  focus_valley_pro_1y: 365,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 호출자 인증 확인 (Authorization 헤더에서 JWT 추출)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 유저 세션 검증
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { orderId, sku } = await req.json();

    if (!orderId || !sku) {
      return new Response(
        JSON.stringify({ error: "orderId and sku are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const durationDays = SKU_DURATION_DAYS[sku];
    if (!durationDays) {
      return new Response(
        JSON.stringify({ error: "Invalid SKU" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 만료일 계산
    const now = new Date();
    const periodEnd = new Date(now.getTime() + durationDays * 86400000);

    // service role로 구독 upsert
    const { error: upsertError } = await supabaseClient
      .from("user_subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan: "pro",
          status: "active",
          current_period_end: periodEnd.toISOString(),
          provider: "toss_iap",
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (upsertError) {
      console.error("[iap-grant] upsert failed:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to update subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, orderId, plan: "pro", expiresAt: periodEnd.toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[iap-grant] unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
