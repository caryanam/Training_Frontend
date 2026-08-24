import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder.supabase.co") &&
    !supabaseAnonKey.includes("placeholder_anon_key")
);

// Fallback safely to a dummy URL if not configured so createClient doesn't throw at initialization
export const supabase = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl : "https://supabase-demo.local",
  isSupabaseConfigured ? supabaseAnonKey : "mock-anon-key",
  {
    auth: {
      autoRefreshToken: isSupabaseConfigured,
      persistSession: true,
      detectSessionInUrl: isSupabaseConfigured,
    },
  }
);
