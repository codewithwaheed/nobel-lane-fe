// Utility function to clean up potentially malformed Supabase URLs
export function getCleanSupabaseUrl(): string {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!url) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
    }

    // Clean up any potential malformed URLs
    if (url.startsWith("=")) {
        url = url.slice(1);
    }

    // Fix any missing slashes in protocol
    if (url.startsWith("https:/") && !url.startsWith("https://")) {
        url = url.replace("https:/", "https://");
    }

    // Ensure URL is valid
    if (!url.startsWith("http")) {
        throw new Error(`Invalid Supabase URL format: ${url}`);
    }

    return url;
}

export function getSupabaseAnonKey(): string {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!key) {
        throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
    }

    return key;
}
