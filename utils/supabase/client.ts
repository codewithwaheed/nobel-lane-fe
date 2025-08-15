import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Clean up any potential malformed URLs
  if (supabaseUrl.startsWith("=")) {
    supabaseUrl = supabaseUrl.slice(1);
  }

  // Ensure URL is valid
  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
