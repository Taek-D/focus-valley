import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const VALID_SKU = "focus_valley_pro";
const TOSS_ORDER_STATUS_URL =
  Deno.env.get("TOSS_ORDER_STATUS_URL")
  ?? "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/order/get-order-status";
const GRANTABLE_ORDER_STATUSES = new Set(["PAYMENT_COMPLETED", "PURCHASED"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OrderStatusSuccess = {
  orderId?: string;
  sku?: string;
  status?: string;
};

type OrderStatusResponse = {
  resultType?: "SUCCESS" | "FAIL";
  success?: OrderStatusSuccess;
  error?: { reason?: string };
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function verifyPaidOrder(params: {
  orderId: string;
  expectedSku: string;
  tossUserKey: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { orderId, expectedSku, tossUserKey } = params;

  const statusRes = await fetch(TOSS_ORDER_STATUS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-toss-user-key": tossUserKey,
    },
    body: JSON.stringify({ orderId }),
  });

  if (!statusRes.ok) {
    return { ok: false, reason: `order status http ${statusRes.status}` };
  }

  const statusBody = await statusRes.json() as OrderStatusResponse;
  if (statusBody.resultType !== "SUCCESS" || !statusBody.success) {
    return { ok: false, reason: statusBody.error?.reason ?? "order status API failure" };
  }

  const { orderId: verifiedOrderId, sku: verifiedSku, status } = statusBody.success;

  if (isNonEmptyString(verifiedOrderId) && verifiedOrderId !== orderId) {
    return { ok: false, reason: "orderId mismatch" };
  }

  if (!isNonEmptyString(verifiedSku) || verifiedSku !== expectedSku) {
    return { ok: false, reason: "sku mismatch" };
  }

  if (!isNonEmptyString(status) || !GRANTABLE_ORDER_STATUSES.has(status)) {
    return { ok: false, reason: `order not grantable: ${status ?? "unknown"}` };
  }

  return { ok: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
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

    const { orderId, sku } = await req.json() as { orderId?: unknown; sku?: unknown };
    if (!isNonEmptyString(orderId) || !isNonEmptyString(sku)) {
      return new Response(
        JSON.stringify({ error: "orderId and sku are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (sku !== VALID_SKU) {
      return new Response(
        JSON.stringify({ error: "Invalid SKU" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!/^[A-Za-z0-9\-_.:]{6,128}$/.test(orderId)) {
      return new Response(
        JSON.stringify({ error: "Invalid orderId format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tossUserKey = user.user_metadata?.toss_user_key as string | undefined;
    if (!isNonEmptyString(tossUserKey)) {
      return new Response(
        JSON.stringify({ error: "Missing toss user metadata" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const verification = await verifyPaidOrder({
      orderId,
      expectedSku: sku,
      tossUserKey,
    });

    if (!verification.ok) {
      console.warn("[iap-grant] verification failed:", verification.reason);
      return new Response(
        JSON.stringify({ error: "Order verification failed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const now = new Date();
    const { error: upsertError } = await supabaseAdmin
      .from("user_subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan: "pro",
          status: "active",
          current_period_end: null,
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
      JSON.stringify({ success: true, orderId, plan: "pro" }),
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
