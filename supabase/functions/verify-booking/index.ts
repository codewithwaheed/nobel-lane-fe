// Supabase Edge Function: verify-booking
// This function verifies if a booking exists for a given payment intent ID
// Used by frontend to confirm webhook processing completed

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Parse request
        const { paymentIntentId } = await req.json();

        if (!paymentIntentId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Payment intent ID is required",
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 400,
                },
            );
        }

        console.log(
            `🔍 Verifying booking for payment intent: ${paymentIntentId}`,
        );

        // Initialize Supabase client with service role key (bypasses RLS)
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );

        // Check if booking exists
        const { data: bookings, error } = await supabaseClient
            .from("bookings")
            .select("id, booking_status, stripe_payment_intent_id, created_at")
            .eq("stripe_payment_intent_id", paymentIntentId);

        if (error) {
            console.log("❌ Database error:", error);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Database error",
                    details: error.message,
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 500,
                },
            );
        }

        // Check if booking was found
        if (!bookings || bookings.length === 0) {
            console.log("❌ Booking not found");
            return new Response(
                JSON.stringify({
                    success: false,
                    found: false,
                    message: "Booking not found",
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 200,
                },
            );
        }

        const booking = bookings[0];
        console.log("✅ Booking found:", booking);

        return new Response(
            JSON.stringify({
                success: true,
                found: true,
                booking: {
                    id: booking.id,
                    status: booking.booking_status,
                    paymentIntentId: booking.stripe_payment_intent_id,
                    createdAt: booking.created_at,
                },
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (error) {
        console.error("❌ Error verifying booking:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to verify booking",
                details: error instanceof Error
                    ? error.message
                    : "Unknown error",
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            },
        );
    }
});
