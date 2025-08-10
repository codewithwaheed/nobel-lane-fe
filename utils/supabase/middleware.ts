import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Simple middleware without Supabase realtime dependencies
  // that cause Edge Runtime compatibility issues
  const response = NextResponse.next({
    request,
  });

  // Authentication protection is currently disabled
  // You can re-enable this when you need route protection

  // For now, just return the response without authentication checks
  return response;
}
