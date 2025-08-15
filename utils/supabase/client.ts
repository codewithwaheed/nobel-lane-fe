import { createBrowserClient } from "@supabase/ssr";
import { getCleanSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase-env";

export function createClient() {
  const supabaseUrl = getCleanSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
