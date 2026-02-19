import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TOSS_API_BASE = "https://api-partner.toss.im/api-partner/v1/apps-in-toss";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { authorizationCode, referrer } = await req.json();

    if (!authorizationCode || !referrer) {
      return new Response(
        JSON.stringify({ error: "authorizationCode and referrer are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1. 인가 코드 → 토스 access token 교환
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

    const { accessToken } = await tokenRes.json();

    // 2. access token → 사용자 정보 조회
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

    const tossUser = await meRes.json();
    const userKey = tossUser.userKey as string;
    const tossName = (tossUser.name as string) ?? null;

    if (!userKey) {
      return new Response(
        JSON.stringify({ error: "No userKey in response" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Supabase에 사용자 생성 또는 로그인 (service role 사용)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 토스 userKey를 이메일 형태로 변환 (Supabase auth는 이메일 기반)
    const tossEmail = `toss_${userKey}@focus-valley.app`;

    // 기존 유저 조회
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === tossEmail,
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // 메타데이터 업데이트
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { toss_user_key: userKey, toss_name: tossName, provider: "toss" },
      });
    } else {
      // 신규 유저 생성 (임시 비밀번호 + 이메일 확인 생략)
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

    // 4. 세션 토큰 생성 (서비스 역할로 직접 JWT 발급은 불가하므로 signInWithPassword 대신
    //    admin.generateLink 또는 custom token 사용)
    //    Supabase에서는 admin API로 직접 세션을 만들 수 없으므로,
    //    magic link 방식으로 세션 생성
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

    // generateLink는 hashed_token을 반환 → verifyOtp으로 세션 생성
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

    // 5. 세션 토큰 반환
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
