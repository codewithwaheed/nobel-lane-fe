// Supabase Edge Function: create-payment-intent
// This replaces the Next.js API route for creating Stripe payment intents

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

// Booking data interface
interface BookingData {
    userId?: string;
    userEmail?: string;
    userPhone?: string;
    email?: string;
    phone?: string;
    type?: string;
    from?: string;
    to?: string;
    duration?: string;
    date?: string;
    time?: string;
    passengers?: number;
    fromZipcode?: string;
    toZipcode?: string;
    fromCity?: string;
    toCity?: string;
    fromState?: string;
    toState?: string;
    selectedVehicle?: {
        id?: number;
        name?: string;
        price?: number;
        passengers?: number;
        bags?: number;
    };
    flightNumber?: string;
    notes?: string;
    earlyPickup?: boolean;
    fromPlaceId?: string;
    toPlaceId?: string;
    fromLat?: number;
    fromLng?: number;
    toLat?: number;
    toLng?: number;
    isQuote?: boolean;
    currentStep?: number;
    completedSteps?: number[];
    submittedAt?: string;
    pricingBreakdown?: {
        baseRate?: number;
        tolls?: number;
        extrasOnly?: number;
        subtotal?: number;
        gratuityRate?: number;
        totalPrice?: number;
        extraStopsCount?: number;
        extras?: {
            extraStops?: number;
            internationalArrival?: number;
            earlyLatePickup?: number;
            holiday?: number;
            dfwToll?: number;
        };
    };
    recommendations?: string[];
}

// Stripe interface
interface CreatePaymentIntentRequest {
    amount: number;
    currency?: string;
    bookingData: BookingData;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return new Response("Method not allowed", {
            status: 405,
            headers: corsHeaders,
        });
    }

    try {
        const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeSecretKey) {
            throw new Error("STRIPE_SECRET_KEY not configured");
        }

        const { amount, currency = "usd", bookingData }:
            CreatePaymentIntentRequest = await req.json();

        console.log(
            "Creating payment intent for amount:",
            amount,
            "currency:",
            currency,
        );

        // Create comprehensive metadata from booking data
        const metadata: Record<string, string> = {
            // User information
            ...(bookingData.userId && { userId: bookingData.userId }),
            userEmail: bookingData.userEmail || bookingData.email || "",
            userPhone: bookingData.userPhone || bookingData.phone || "",

            // Trip details
            tripType: bookingData.type || "one-way",
            from: bookingData.from || "",
            to: bookingData.to || "",
            duration: bookingData.duration || "",
            date: bookingData.date || "",
            time: bookingData.time || "",
            passengers: bookingData.passengers?.toString() || "1",

            // Location zip codes and additional details
            fromZipcode: bookingData.fromZipcode || "",
            toZipcode: bookingData.toZipcode || "",
            fromCity: bookingData.fromCity || "",
            toCity: bookingData.toCity || "",
            fromState: bookingData.fromState || "",
            toState: bookingData.toState || "",

            // Customer information (legacy support)
            customerPhone: bookingData.phone || "",
            customerEmail: bookingData.email || "",

            // Vehicle information
            vehicleId: bookingData.selectedVehicle?.id?.toString() || "",
            vehicleName: bookingData.selectedVehicle?.name || "",
            vehiclePrice: bookingData.selectedVehicle?.price?.toString() || "",
            vehiclePassengers:
                bookingData.selectedVehicle?.passengers?.toString() || "",
            vehicleBags: bookingData.selectedVehicle?.bags?.toString() || "",

            // Additional trip information
            flightNumber: bookingData.flightNumber || "",
            specialInstructions: bookingData.notes || "",

            // Early pickup request
            earlyPickup: bookingData.earlyPickup?.toString() || "false",

            // Place details (if using Google Places)
            fromPlaceId: bookingData.fromPlaceId || "",
            toPlaceId: bookingData.toPlaceId || "",
            fromLat: bookingData.fromLat?.toString() || "",
            fromLng: bookingData.fromLng?.toString() || "",
            toLat: bookingData.toLat?.toString() || "",
            toLng: bookingData.toLng?.toString() || "",

            // Booking metadata
            isQuote: bookingData.isQuote?.toString() || "false",
            currentStep: bookingData.currentStep?.toString() || "",
            completedSteps: JSON.stringify(bookingData.completedSteps || []),
            submittedAt: bookingData.submittedAt || new Date().toISOString(),

            // Pricing breakdown
            baseAmount: amount.toString(),
            serviceFeeRate: "0.05", // 5%
            currency: currency,

            // Detailed pricing breakdown (if available)
            ...(bookingData.pricingBreakdown && {
                baseRate: bookingData.pricingBreakdown.baseRate?.toString() ||
                    "",
                tollsAmount: bookingData.pricingBreakdown.tolls?.toString() ||
                    "",
                extrasAmount:
                    bookingData.pricingBreakdown.extrasOnly?.toString() || "",
                subtotalAmount:
                    bookingData.pricingBreakdown.subtotal?.toString() || "",
                gratuityAmount:
                    bookingData.pricingBreakdown.gratuityRate?.toString() || "",
                totalCalculated:
                    bookingData.pricingBreakdown.totalPrice?.toString() || "",
                extraStopsCount:
                    bookingData.pricingBreakdown.extraStopsCount?.toString() ||
                    "",
                // Extra services breakdown
                extraStopsFee: bookingData.pricingBreakdown.extras?.extraStops
                    ?.toString() || "",
                internationalArrivalFee:
                    bookingData.pricingBreakdown.extras?.internationalArrival
                        ?.toString() || "",
                earlyLatePickupFee:
                    bookingData.pricingBreakdown.extras?.earlyLatePickup
                        ?.toString() || "",
                holidayFee:
                    bookingData.pricingBreakdown.extras?.holiday?.toString() ||
                    "",
                dfwTollFee:
                    bookingData.pricingBreakdown.extras?.dfwToll?.toString() ||
                    "",
            }),

            // Trip recommendations (if available)
            ...(bookingData.recommendations && {
                recommendation1: bookingData.recommendations[0] || "",
                recommendation2: bookingData.recommendations[1] || "",
                recommendation3: bookingData.recommendations[2] || "",
            }),
        };

        // Create PaymentIntent using Stripe API directly
        const paymentIntentData = {
            amount: Math.round(amount * 100), // Stripe expects amounts in cents
            currency,
            receipt_email: bookingData.userEmail || bookingData.email ||
                undefined,
            metadata,
            payment_method_types: ["card"],
        };

        console.log("Creating Stripe PaymentIntent with data:", {
            amount: paymentIntentData.amount,
            currency: paymentIntentData.currency,
            metadataKeys: Object.keys(metadata),
        });

        // Call Stripe API directly
        const stripeResponse = await fetch(
            "https://api.stripe.com/v1/payment_intents",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${stripeSecretKey}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    amount: paymentIntentData.amount.toString(),
                    currency: paymentIntentData.currency,
                    ...(paymentIntentData.receipt_email &&
                        { receipt_email: paymentIntentData.receipt_email }),
                    "payment_method_types[]": "card", // Only allow card payments
                    // Add metadata as form fields
                    ...Object.fromEntries(
                        Object.entries(metadata).map((
                            [key, value],
                        ) => [`metadata[${key}]`, value]),
                    ),
                }),
            },
        );

        if (!stripeResponse.ok) {
            const errorData = await stripeResponse.text();
            console.error("Stripe API error:", errorData);
            throw new Error(
                `Stripe API error: ${stripeResponse.status} ${errorData}`,
            );
        }

        const paymentIntent = await stripeResponse.json();

        console.log("✅ PaymentIntent created successfully:", paymentIntent.id);

        return new Response(
            JSON.stringify({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (error) {
        console.error("Error creating payment intent:", error);
        const errorMessage = error instanceof Error
            ? error.message
            : "Unknown error occurred";

        return new Response(
            JSON.stringify({
                error: "Failed to create payment intent",
                details: errorMessage,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            },
        );
    }
});
