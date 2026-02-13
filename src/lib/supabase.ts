import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yidyxlwrongecctifiis.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZHl4bHdyb25nZWNjdGlmaWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzE4MjEsImV4cCI6MjA4NTYwNzgyMX0.4rzxPv0IPEtfWgJjvtQiM7kB4EU1R23FL-WRtMtd6ao";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
