import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIG_ERROR =
    "Cloud sync is not configured for this build. Add Supabase environment variables to enable sign-in and sync.";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
    ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
    : null;
