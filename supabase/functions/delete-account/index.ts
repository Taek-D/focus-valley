// Supabase Edge Function: delete-account
// Deletes the authenticated user's account server-side using the service_role key.
// Never exposes service_role key to the client.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
    // Only allow POST
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Require Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return new Response(JSON.stringify({ error: "Missing authorization header" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
        return new Response(JSON.stringify({ error: "Server configuration error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Identify the caller using their JWT
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await userClient.auth.getUser(token);

    if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Delete the user account via admin API
    const { error: deleteError } = await userClient.auth.admin.deleteUser(userData.user.id);

    if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
});
