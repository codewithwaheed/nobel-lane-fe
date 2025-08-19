// Supabase Edge Function: get-quote-details
// Fetches quote details by quote ID to pre-fill booking wizard

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
};

interface QuoteDetailsResponse {
    success: boolean;
    data?: {
        // Customer information
        customer_email: string;
        customer_phone?: string;
        customer_first_name?: string;
        customer_last_name?: string;

        // Trip details
        trip_type: string;
        pickup_location: string;
        dropoff_location?: string;
        pickup_date: string;
        pickup_time: string;
        passengers: number;

        // Vehicle information
        vehicleType: string;
        vehicleName?: string;

        // Location details (for API calls)
        fromZipcode?: string;
        toZipcode?: string;
        fromCity?: string;
        toCity?: string;
        fromState?: string;
        toState?: string;
        fromPlaceId?: string;
        toPlaceId?: string;
        fromLat?: number;
        fromLng?: number;
        toLat?: number;
        toLng?: number;

        // Additional details
        flightNumber?: string;
        specialRequests?: string;
        duration?: string;

        // Pricing information (if available)
        pricingBreakdown?: {
            baseRate?: number;
            tolls?: number;
            extras?: number;
            gratuity?: number;
            subtotal?: number;
            totalCalculated?: number;
        };
    };
    error?: string;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "GET") {
        return new Response(
            JSON.stringify({ success: false, error: "Method not allowed" }),
            {
                status: 405,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }

    try {
        // Get quote ID from URL parameters
        const url = new URL(req.url);
        const quoteId = url.searchParams.get("quoteId");

        if (!quoteId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Quote ID is required",
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        console.log(`📋 Fetching quote details for ID: ${quoteId}`);

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase environment variables");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch quote from database by quote_number
        console.log(`🔍 Searching for quote with quote_number: ${quoteId}`);

        const { data: quote, error } = await supabase
            .from("quotes")
            .select("*")
            .eq("quote_number", quoteId)
            .single();

        if (error) {
            console.error("Database error:", error);
            if (error.code === "PGRST116") {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "Quote not found",
                    }),
                    {
                        status: 404,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    },
                );
            }
            throw error;
        }

        if (!quote) {
            return new Response(
                JSON.stringify({ success: false, error: "Quote not found" }),
                {
                    status: 404,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        console.log(`✅ Found quote: ${quote.quote_number}`);

        // Transform database quote to booking wizard format
        const quoteDetails: QuoteDetailsResponse = {
            success: true,
            data: {
                // Customer information
                customer_email: quote.customer_email,
                customer_phone: quote.customer_phone,
                customer_first_name: quote.customer_first_name,
                customer_last_name: quote.customer_last_name,

                // Trip details
                trip_type: quote.trip_type || "one-way",
                pickup_location: quote.pickup_address,
                dropoff_location: quote.destination_address,
                pickup_date: quote.pickup_date,
                pickup_time: quote.pickup_time,
                passengers: quote.passengers,
                duration: quote.trip_duration, // Use correct database column name

                // Vehicle information
                vehicle_type: quote.vehicle_type,
                vehicle_name: quote.vehicle_name,

                // Flight information
                flight_number: quote.flight_number,
                special_requests: quote.special_requests,

                // Location details (zones for pricing) - using correct database column names
                pickup_zipcode: quote.pickup_zipcode,
                dropoff_zipcode: quote.destination_zipcode, // Use destination_zipcode from database
                from_city: quote.pickup_city, // Map to pickup_city
                to_city: quote.destination_city, // Map to destination_city
                from_state: quote.pickup_state, // Map to pickup_state
                to_state: quote.destination_state, // Map to destination_state
                from_place_id: quote.pickup_place_id,
                to_place_id: quote.destination_place_id,
                from_lat: quote.pickup_latitude,
                from_lng: quote.pickup_longitude,
                to_lat: quote.destination_latitude,
                to_lng: quote.destination_longitude,

                // Pricing information (if available)
                ...(quote.base_rate && {
                    pricingBreakdown: {
                        baseRate: quote.base_rate,
                        tolls: quote.tolls_amount,
                        extras: quote.extras_amount,
                        gratuity: quote.gratuity_amount,
                        subtotal: quote.subtotal_amount,
                        totalCalculated: quote.total_amount,
                    },
                }),
            },
        };

        return new Response(JSON.stringify(quoteDetails), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        console.error("❌ Error fetching quote details:", error);
        const errorMessage = error instanceof Error
            ? error.message
            : "Unknown error";

        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to fetch quote details",
                details: errorMessage,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
