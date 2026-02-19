import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TOSS_API_BASE = "https://api-partner.toss.im/api-partner/v1/apps-in-toss";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function findUserByEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string,
): Promise<{ id: string } | null> {
  const perPage = 200;
  const maxPages = 50;

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const users = data?.users ?? [];
    const found = users.find((u) => u.email === email);
    if (found) {
      return { id: found.id };
    }

    if (users.length < perPage) {
      break;
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { authorizationCode, referrer } = await req.json() as {
      authorizationCode?: unknown;
      referrer?: unknown;
    };

    if (!isNonEmptyString(authorizationCode) || !isNonEmptyString(referrer)) {
      return new Response(
        JSON.stringify({ error: "authorizationCode and referrer are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tokenRes = await fetch(`${TOSS_API_BASE}/user/oauth2/generate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorizationCode, referrer }),
    });

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text();
      console.error("[toss-auth] token exchange failed:", errorBody);
      return new Response(
        JSON.stringify({ error: "Token exchange failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { accessToken } = await tokenRes.json() as { accessToken?: string };
    if (!isNonEmptyString(accessToken)) {
      return new Response(
        JSON.stringify({ error: "Missing access token from Toss" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const meRes = await fetch(`${TOSS_API_BASE}/user/oauth2/login-me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meRes.ok) {
      const errorBody = await meRes.text();
      console.error("[toss-auth] user info failed:", errorBody);
      return new Response(
        JSON.stringify({ error: "Failed to get user info" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tossUser = await meRes.json() as { userKey?: string; name?: string };
    const userKey = tossUser.userKey;
    const tossName = tossUser.name ?? null;

    if (!isNonEmptyString(userKey)) {
      return new Response(
        JSON.stringify({ error: "No userKey in response" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const tossEmail = `toss_${userKey}@focus-valley.app`;

    let existingUser: { id: string } | null;
    try {
      existingUser = await findUserByEmail(supabaseAdmin, tossEmail);
    } catch (listError) {
      console.error("[toss-auth] list users failed:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to lookup user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { toss_user_key: userKey, toss_name: tossName, provider: "toss" },
      });
    } else {
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: tossEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { toss_user_key: userKey, toss_name: tossName, provider: "toss" },
      });

      if (createError || !newUser.user) {
        console.error("[toss-auth] create user failed:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      userId = newUser.user.id;
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: tossEmail,
    });

    if (linkError || !linkData) {
      console.error("[toss-auth] generate link failed:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: sessionData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

    if (verifyError || !sessionData.session) {
      console.error("[toss-auth] verify otp failed:", verifyError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[toss-auth] unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
