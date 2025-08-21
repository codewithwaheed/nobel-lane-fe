// Supabase Edge Function: create-quote
// Handles both booking-quote and get-quote flows

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface QuoteRequest {
    // Quote type identification
    quoteType: "booking-quote" | "get-quote";
    quoteSource?: string;

    // Customer information
    customerEmail: string;
    customerPhone?: string;
    customerFirstName?: string;
    customerLastName?: string;
    customerCompany?: string;

    // Trip details
    tripType?: string;
    from: string;
    to?: string;
    date: string;
    time: string;
    returnDate?: string;
    returnTime?: string;
    duration?: string;
    passengers?: number;

    // Location details
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

    // Vehicle and service
    selectedVehicle?: {
        id: number;
        name: string;
        price: number;
    };
    flightNumber?: string;
    specialInstructions?: string;

    // Pricing (calculated on frontend)
    pricingBreakdown?: {
        baseRate: number;
        tolls: number;
        extras: number;
        subtotal: number;
        gratuity: number;
        totalCalculated: number;
        extrasBreakdown?: {
            extraStops?: number;
            internationalArrival?: number;
            earlyLatePickup?: number;
            holiday?: number;
            dfwToll?: number;
        };
        // Enhanced pricing structure for email templates
        emailPricingBreakdown?: {
            baseRate: number;
            gratuity: number;
            gratuityPercentage: number;
            additionalFees: Array<{
                name: string;
                amount: number;
                description?: string;
            }>;
            totalAmount: number;
        };
    };

    // Additional data
    recommendations?: string[];
    originalFormData?: Record<string, unknown>;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            {
                status: 405,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }

    try {
        console.log("💬 Creating quote request...");

        // Initialize Supabase client
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );

        // Parse request body
        const quoteRequest: QuoteRequest = await req.json();

        // DEBUG: Log the complete request to see pricing data
        console.log("🔍 DEBUGGING: Complete quote request received:", {
            selectedVehicle: quoteRequest.selectedVehicle,
            pricingBreakdown: quoteRequest.pricingBreakdown,
            hasVehicle: !!quoteRequest.selectedVehicle,
            hasPricing: !!quoteRequest.pricingBreakdown,
            vehicleName: quoteRequest.selectedVehicle?.name,
            baseRate: quoteRequest.pricingBreakdown?.baseRate,
            totalCalculated: quoteRequest.pricingBreakdown?.totalCalculated,
        });
        // Normalize trip type to match database constraints
        const normalizeTripType = (tripType: string): string => {
            switch (tripType) {
                case "by-the-hour":
                    return "hourly";
                case "one-way":
                    return "one-way";
                default:
                    return "one-way"; // Default fallback
            }
        };

        console.log("📝 Quote request data:", {
            type: quoteRequest.quoteType,
            email: quoteRequest.customerEmail,
            from: quoteRequest.from,
            to: quoteRequest.to,
            date: quoteRequest.date,
        });

        // Validate required fields
        if (
            !quoteRequest.customerEmail || !quoteRequest.from ||
            !quoteRequest.date || !quoteRequest.time
        ) {
            return new Response(
                JSON.stringify({
                    error:
                        "Missing required fields: customerEmail, from, date, time",
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

        // Helper function to safely parse numbers
        const parseFloatSafe = (
            value: number | string | undefined,
            defaultValue = 0,
        ): number => {
            if (typeof value === "number") {
                return isNaN(value) ? defaultValue : value;
            }
            if (typeof value === "string") {
                const parsed = globalThis.parseFloat(value);
                return isNaN(parsed) ? defaultValue : parsed;
            }
            return defaultValue;
        };

        // Prepare quote data for database insertion
        const quoteData = {
            // Quote identification
            quote_type: quoteRequest.quoteType || "get-quote",
            quote_source: quoteRequest.quoteSource || "website",

            // Customer information
            customer_email: quoteRequest.customerEmail,
            customer_phone: quoteRequest.customerPhone || "",
            customer_first_name: quoteRequest.customerFirstName || "",
            customer_last_name: quoteRequest.customerLastName || "",
            customer_company: quoteRequest.customerCompany || "",

            // Trip details
            trip_type: normalizeTripType(quoteRequest.tripType || "one-way"),
            pickup_address: quoteRequest.from,
            destination_address: quoteRequest.to || "",
            pickup_date: quoteRequest.date,
            pickup_time: quoteRequest.time,
            trip_duration: quoteRequest.duration || null,
            passengers: quoteRequest.passengers || 1,

            // Location details
            pickup_zipcode: quoteRequest.fromZipcode || "",
            destination_zipcode: quoteRequest.toZipcode || "",
            pickup_city: quoteRequest.fromCity || "",
            destination_city: quoteRequest.toCity || "",
            pickup_state: quoteRequest.fromState || "",
            destination_state: quoteRequest.toState || "",
            pickup_place_id: quoteRequest.fromPlaceId || "",
            destination_place_id: quoteRequest.toPlaceId || "",
            pickup_latitude: quoteRequest.fromLat || null,
            pickup_longitude: quoteRequest.fromLng || null,
            destination_latitude: quoteRequest.toLat || null,
            destination_longitude: quoteRequest.toLng || null,

            // Vehicle information
            vehicle_type: quoteRequest.selectedVehicle?.id?.toString() ||
                "sedan",
            vehicle_name: quoteRequest.selectedVehicle?.name ||
                "Standard Vehicle",
            flight_number: quoteRequest.flightNumber || "",
            special_instructions: quoteRequest.specialInstructions || "",

            // Pricing information
            base_rate: parseFloatSafe(quoteRequest.pricingBreakdown?.baseRate),
            tolls_amount: parseFloatSafe(quoteRequest.pricingBreakdown?.tolls),
            extras_amount: parseFloatSafe(
                quoteRequest.pricingBreakdown?.extras,
            ),
            gratuity_amount: parseFloatSafe(
                quoteRequest.pricingBreakdown?.gratuity,
            ),
            subtotal_amount: parseFloatSafe(
                quoteRequest.pricingBreakdown?.subtotal,
            ),
            total_amount: parseFloatSafe(
                quoteRequest.pricingBreakdown?.totalCalculated,
            ),
            currency: "usd",

            // Extra services (from pricing breakdown)
            extra_stops_count: parseFloatSafe(
                quoteRequest.pricingBreakdown?.extrasBreakdown?.extraStops
                    ? 1
                    : 0,
            ),
            extra_stops_fee: parseFloatSafe(
                quoteRequest.pricingBreakdown?.extrasBreakdown?.extraStops,
            ),
            international_arrival_fee: parseFloatSafe(
                quoteRequest.pricingBreakdown?.extrasBreakdown
                    ?.internationalArrival,
            ),
            early_late_pickup_fee: parseFloatSafe(
                quoteRequest.pricingBreakdown?.extrasBreakdown?.earlyLatePickup,
            ),
            holiday_fee: parseFloatSafe(
                quoteRequest.pricingBreakdown?.extrasBreakdown?.holiday,
            ),
            dfw_toll_fee: parseFloatSafe(
                quoteRequest.pricingBreakdown?.extrasBreakdown?.dfwToll,
            ),

            // Metadata
            recommendations: quoteRequest.recommendations || [],
            form_data: quoteRequest.originalFormData || {},

            // Status
            quote_status: "pending",
        };

        console.log("💾 Inserting quote into database...");

        // Insert quote into database
        const { data: quote, error: quoteError } = await supabaseClient
            .from("quotes")
            .insert(quoteData)
            .select("id, quote_status, created_at")
            .single();

        if (quoteError) {
            console.error("❌ Database error:", quoteError);
            throw new Error(`Database error: ${quoteError.message}`);
        }

        // Generate formatted quote number and update the record
        const quoteNumber = `QT-${String(quote.id).slice(0, 8).toUpperCase()}`;

        // Update the quote with the formatted quote_number
        const { error: updateError } = await supabaseClient
            .from("quotes")
            .update({ quote_number: quoteNumber })
            .eq("id", quote.id);

        if (updateError) {
            console.error("❌ Error updating quote number:", updateError);
            // Don't throw error here, quote is still valid without quote_number
        } else {
            console.log("✅ Quote number updated:", quoteNumber);
        }

        console.log("✅ Quote created successfully:", quote.id);

        // Send quote confirmation email
        try {
            console.log(
                "📧 Preparing to send quote confirmation email with data:",
                {
                    vehicleName: quoteRequest.selectedVehicle?.name ||
                        "Standard Vehicle",
                    totalCalculated: quoteRequest.pricingBreakdown
                        ?.totalCalculated,
                    baseRate: quoteRequest.pricingBreakdown?.baseRate,
                    gratuity: quoteRequest.pricingBreakdown?.gratuity,
                    pricingBreakdown: quoteRequest.pricingBreakdown,
                },
            );

            const emailResponse = await fetch(
                `${
                    Deno.env.get("SUPABASE_URL")
                }/functions/v1/send-booking-confirmation`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${
                            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
                        }`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: "quote",
                        quoteId: quote.id, // Use the actual quote ID for database lookup
                        quoteNumber: quoteNumber,
                        customerEmail: quoteRequest.customerEmail,
                        customerName: `${
                            quoteRequest.customerFirstName || "Valued"
                        } ${quoteRequest.customerLastName || "Customer"}`,
                        pickupAddress: quoteRequest.from,
                        destinationAddress: quoteRequest.to,
                        pickupDate: new Date(quoteRequest.date)
                            .toLocaleDateString(),
                        pickupTime: quoteRequest.time,
                        passengers: quoteRequest.passengers || 1,
                        vehicleName: quoteRequest.selectedVehicle?.name ||
                            "Standard Vehicle",
                        totalAmount: parseFloatSafe(
                            quoteRequest.pricingBreakdown?.totalCalculated,
                        ),
                        pricingBreakdown: quoteRequest.pricingBreakdown
                            ? {
                                baseRate: parseFloatSafe(
                                    quoteRequest.pricingBreakdown?.baseRate,
                                ) || 0,
                                gratuity: parseFloatSafe(
                                    quoteRequest.pricingBreakdown?.gratuity,
                                ) || 0,
                                gratuityPercentage: 20,
                                totalAmount: parseFloatSafe(
                                    quoteRequest.pricingBreakdown
                                        ?.totalCalculated,
                                ) || 0,
                                // Enhanced additional fees from the detailed breakdown
                                additionalFees:
                                    quoteRequest.pricingBreakdown
                                        .emailPricingBreakdown
                                        ?.additionalFees || [],
                            }
                            : undefined,
                        sendSMS: true, // Enable SMS notifications for quotes
                        phoneNumber: quoteRequest.customerPhone,
                    }),
                },
            );

            console.log(
                "📧 Quote email service response:",
                emailResponse.ok ? "sent" : "failed",
            );

            if (!emailResponse.ok) {
                console.error(
                    "📧 Email sending failed:",
                    await emailResponse.text(),
                );
            }
        } catch (emailError) {
            console.error("📧 Quote email sending failed:", emailError);
            // Don't fail the quote creation if email fails
        }

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                quoteId: quote.id,
                quoteStatus: quote.quote_status,
                createdAt: quote.created_at,
                message: "Quote request submitted successfully",
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 201,
            },
        );
    } catch (error) {
        console.error("❌ Error creating quote:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to create quote",
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
