// Supabase Edge Function: process-booking-payment
// This handles Stripe webhooks and processes booking data from payment intent metadata

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Stripe webhook event interface
interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: StripePaymentIntent | Record<string, unknown>;
  };
  created: number;
}

// Payment Intent from Stripe
interface StripePaymentIntent {
  id: string;
  amount: number;
  status: string;
  receipt_email: string;
  metadata: Record<string, string>;
}

// Charge from Stripe (contains payment_intent reference)
interface StripeCharge {
  id: string;
  amount: number;
  status: string;
  receipt_email: string;
  payment_intent: string; // Reference to the payment intent ID
  metadata: Record<string, string>;
}

interface BookingPaymentData {
  // Payment information
  paymentIntentId: string;
  paymentStatus: string;

  // User information
  userId?: string;
  userEmail?: string;
  userPhone?: string;

  // Customer information (legacy support)
  customerEmail?: string;
  customerPhone?: string;

  // Trip details
  tripType?: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  flightNumber?: string;
  specialInstructions?: string;
  tripDuration?: string;
  isQuote?: boolean;

  // Location details
  pickupZipcode?: string;
  destinationZipcode?: string;
  pickupCity?: string;
  destinationCity?: string;
  pickupState?: string;
  destinationState?: string;
  pickupPlaceId?: string;
  destinationPlaceId?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;

  // Vehicle information
  vehicleName: string;
  vehicleType: string;

  // Pricing breakdown
  baseRate?: number;
  tollsAmount?: number;
  extrasAmount?: number;
  gratuityAmount?: number;
  subtotalAmount?: number;
  totalAmount: number;

  // Extra services
  extraStopsCount?: number;
  extraStopsFee?: number;
  internationalArrivalFee?: number;
  earlyLatePickupFee?: number;
  holidayFee?: number;
  dfwTollFee?: number;

  // Legacy fields (for backward compatibility)
  basePrice?: number;
  serviceFee?: number;
  bookingType?: string;

  // Metadata
  metadata?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("Received webhook request:", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
  });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Parse the Stripe webhook event
    const event: StripeEvent = await req.json();
    console.log("Stripe webhook event received:", event.type, event.id);

    // Handle different Stripe event types
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("💰 Payment intent succeeded, processing booking...");
        return await handlePaymentSuccess(
          event.data.object as StripePaymentIntent,
          supabaseClient,
        );

      case "charge.succeeded":
        console.log("💳 Charge succeeded, processing booking...");
        return await handleChargeSuccess(
          event.data.object as StripeCharge,
          supabaseClient,
        );

      case "payment_intent.payment_failed":
        console.log("❌ Payment failed");
        return await handlePaymentFailure(
          event.data.object as StripePaymentIntent,
        );

      case "payment_intent.canceled":
        console.log("🚫 Payment canceled");
        return await handlePaymentCancellation(
          event.data.object as StripePaymentIntent,
        );

      default:
        console.log(`🤷‍♂️ Unhandled event type: ${event.type}`);
        return new Response(
          JSON.stringify({
            received: true,
            message: `Event ${event.type} received but not processed`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

// Handle successful payment and create booking
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentSuccess(
  paymentIntent: StripePaymentIntent,
  supabaseClient: any,
) {
  try {
    console.log("Processing payment success for:", paymentIntent.id);

    // Extract booking data from payment intent metadata
    const metadata = paymentIntent.metadata;
    console.log("Payment intent metadata:", metadata);

    // Parse numeric values safely
    const parseFloatSafe = (
      value: string | undefined,
      defaultValue = 0,
    ): number => {
      const parsed = value ? globalThis.parseFloat(value) : defaultValue;
      return isNaN(parsed) ? defaultValue : parsed;
    };

    const parseIntSafe = (
      value: string | undefined,
      defaultValue = 0,
    ): number => {
      const parsed = value ? globalThis.parseInt(value, 10) : defaultValue;
      return isNaN(parsed) ? defaultValue : parsed;
    };

    // Check if booking already exists for this payment intent
    const { data: existingBooking } = await supabaseClient
      .from("bookings")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .single();

    if (existingBooking) {
      console.log(
        `⚠️ Booking already exists for payment intent ${paymentIntent.id}, skipping duplicate creation`,
      );
      return new Response(
        JSON.stringify({
          success: true,
          message: "Booking already processed",
          bookingId: existingBooking.id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }
    console.log({ metadata });
    // 1. Create booking record in database with comprehensive data
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({
        // User linking
        user_id: metadata.userId || null,

        // Customer information (with improved fallback logic)
        customer_email: metadata.userEmail ??
          paymentIntent.receipt_email ??
          metadata.customerEmail ?? "",
        customer_phone: metadata.phone ||
          metadata.customerPhone ||
          metadata.userPhone || // additional fallback
          "",

        // Trip details
        trip_type: normalizeTripType(metadata.tripType || "one-way"),
        pickup_address: metadata.from || "",
        destination_address: metadata.to || "",
        pickup_date: metadata.date || "",
        pickup_time: metadata.time || "",
        trip_duration: metadata.duration || null,
        passengers: parseIntSafe(metadata.passengers, 1),
        flight_number: metadata.flightNumber || null,
        special_instructions: metadata.specialInstructions || null,
        is_quote: metadata.isQuote === "true",

        // Location details
        pickup_zipcode: metadata.fromZipcode || null,
        destination_zipcode: metadata.toZipcode || null,
        pickup_city: metadata.fromCity || null,
        destination_city: metadata.toCity || null,
        pickup_state: metadata.fromState || null,
        destination_state: metadata.toState || null,
        pickup_place_id: metadata.fromPlaceId || null,
        destination_place_id: metadata.toPlaceId || null,
        pickup_latitude: parseFloatSafe(metadata.fromLat) || null,
        pickup_longitude: parseFloatSafe(metadata.fromLng) || null,
        destination_latitude: parseFloatSafe(metadata.toLat) || null,
        destination_longitude: parseFloatSafe(metadata.toLng) || null,

        // Vehicle information
        vehicle_type: metadata.vehicleId || "sedan",
        vehicle_name: metadata.vehicleName || "Standard Vehicle",

        // Pricing breakdown
        base_rate: parseFloatSafe(metadata.baseRate),
        tolls_amount: parseFloatSafe(metadata.tollsAmount),
        extras_amount: parseFloatSafe(metadata.extrasAmount),
        gratuity_amount: parseFloatSafe(metadata.gratuityAmount),
        subtotal_amount: parseFloatSafe(metadata.subtotalAmount),
        total_amount: paymentIntent.amount / 100, // Convert from cents

        // Extra services
        extra_stops_count: parseIntSafe(metadata.extraStopsCount),
        extra_stops_fee: parseFloatSafe(metadata.extraStopsFee),
        international_arrival_fee: parseFloatSafe(
          metadata.internationalArrivalFee,
        ),
        early_late_pickup_fee: parseFloatSafe(metadata.earlyLatePickupFee),
        early_pickup_requested: metadata.earlyPickup === "true",
        holiday_fee: parseFloatSafe(metadata.holidayFee),
        dfw_toll_fee: parseFloatSafe(metadata.dfwTollFee),

        // Legacy fields (for backward compatibility)
        base_price: parseFloatSafe(metadata.vehiclePrice) ||
          parseFloatSafe(metadata.baseRate),
        service_fee: parseFloatSafe(metadata.baseAmount) * 0.05, // 5% service fee

        // Payment information
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status: paymentIntent.status,

        // Booking status
        booking_status: "confirmed",
        booking_type: metadata.isQuote === "true" ? "quote" : "standard",
        booking_source: "website",
      })
      .select()
      .single();

    if (bookingError) {
      throw new Error(`Database error: ${bookingError.message}`);
    }

    console.log("✅ Booking created successfully:", booking.id);

    // 2. Generate confirmation number and update the record
    const confirmationNumber = `NL-${
      String(booking.id).slice(0, 8).toUpperCase()
    }`;

    // Update the booking with the formatted booking_number
    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({ booking_number: confirmationNumber })
      .eq("id", booking.id);

    if (updateError) {
      console.error("❌ Error updating booking number:", updateError);
      // Don't throw error here, booking is still valid without booking_number
    } else {
      console.log("✅ Booking number updated:", confirmationNumber);
    }

    // 3. Send confirmation email via Edge Function
    try {
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
            type: "booking",
            bookingId: booking.id,
            customerEmail: metadata.userEmail || paymentIntent.receipt_email ||
              metadata.customerEmail,
            customerName: "Valued Customer", // We'll improve this when we collect names
            pickupAddress: metadata.from || "",
            destinationAddress: metadata.to || "",
            pickupDate: new Date(metadata.date || "").toLocaleDateString(),
            pickupTime: metadata.time || "",
            passengers: parseIntSafe(metadata.passengers, 1),
            vehicleName: metadata.vehicleName || "Standard Vehicle",
            totalAmount: paymentIntent.amount / 100,
            confirmationNumber,
            sendSMS: true, // Enable SMS notifications for bookings
            phoneNumber: metadata.userPhone || metadata.customerPhone,
            // Add detailed pricing breakdown
            pricingBreakdown: {
              baseRate: parseFloatSafe(metadata.baseRate),
              gratuity: parseFloatSafe(metadata.gratuityAmount),
              gratuityPercentage: 20, // Standard 20% gratuity
              additionalFees: [
                // Add tolls if present
                ...(parseFloatSafe(metadata.tollsAmount) > 0
                  ? [{
                    name: "DFW Airport Toll",
                    amount: parseFloatSafe(metadata.tollsAmount),
                    description: "Airport toll fees",
                  }]
                  : []),
                // Add extra stops fee if present
                ...(parseFloatSafe(metadata.extraStopsFee) > 0
                  ? [{
                    name: "Extra Stops",
                    amount: parseFloatSafe(metadata.extraStopsFee),
                    description: `Additional ${
                      metadata.extraStopsCount || 1
                    } stop${
                      (parseIntSafe(metadata.extraStopsCount, 0) > 1) ? "s" : ""
                    } ($10 each)`,
                  }]
                  : []),
                // Add international arrival fee if present
                ...(parseFloatSafe(metadata.internationalArrivalFee) > 0
                  ? [{
                    name: "International Arrival",
                    amount: parseFloatSafe(metadata.internationalArrivalFee),
                    description: "International arrival processing fee",
                  }]
                  : []),
                // Add early/late pickup fee if present
                ...(parseFloatSafe(metadata.earlyLatePickupFee) > 0
                  ? [{
                    name: "Early/Late Pickup",
                    amount: parseFloatSafe(metadata.earlyLatePickupFee),
                    description: "Pickup outside standard hours (6 AM - 10 PM)",
                  }]
                  : []),
                // Add holiday fee if present
                ...(parseFloatSafe(metadata.holidayFee) > 0
                  ? [{
                    name: "Holiday Surcharge",
                    amount: parseFloatSafe(metadata.holidayFee),
                    description: "Holiday booking surcharge",
                  }]
                  : []),
              ],
              totalAmount: paymentIntent.amount / 100,
            },
          }),
        },
      );

      console.log(
        "📧 Email service response:",
        emailResponse.ok ? "sent" : "failed",
      );
    } catch (emailError) {
      console.error("📧 Email sending failed:", emailError);
      // Don't fail the booking if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        bookingId: booking.id,
        confirmationNumber,
        message: "Booking processed successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("❌ Error processing successful payment:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
}

// Normalize trip type to match database constraints
function normalizeTripType(tripType: string): string {
  switch (tripType) {
    case "by-the-hour":
      return "hourly";
    case "one-way":
      return "one-way";
    default:
      return "one-way";
  }
}

// Handle successful charge by fetching the associated PaymentIntent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleChargeSuccess(
  charge: StripeCharge,
  supabaseClient: any,
) {
  try {
    console.log("Processing charge success for:", charge.id);
    console.log("Associated payment intent:", charge.payment_intent);

    // Fetch the PaymentIntent from Stripe to get the metadata
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const paymentIntentResponse = await fetch(
      `https://api.stripe.com/v1/payment_intents/${charge.payment_intent}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (!paymentIntentResponse.ok) {
      throw new Error(
        `Failed to fetch PaymentIntent: ${paymentIntentResponse.statusText}`,
      );
    }

    const paymentIntent = await paymentIntentResponse
      .json() as StripePaymentIntent;
    console.log("Fetched PaymentIntent with metadata for charge processing");

    // Now process the booking using the PaymentIntent data (which has metadata)
    return await handlePaymentSuccess(paymentIntent, supabaseClient);
  } catch (error) {
    console.error("❌ Error processing charge success:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to process charge success",
        details: error instanceof Error ? error.message : "Unknown error",
        chargeId: charge.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
}

// Handle payment failure
function handlePaymentFailure(paymentIntent: StripePaymentIntent) {
  console.log("❌ Payment failed for:", paymentIntent.id);

  return new Response(
    JSON.stringify({
      success: false,
      message: "Payment failed",
      paymentIntentId: paymentIntent.id,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    },
  );
}

// Handle payment cancellation
function handlePaymentCancellation(paymentIntent: StripePaymentIntent) {
  console.log("🚫 Payment canceled for:", paymentIntent.id);

  return new Response(
    JSON.stringify({
      success: false,
      message: "Payment canceled",
      paymentIntentId: paymentIntent.id,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    },
  );
}
