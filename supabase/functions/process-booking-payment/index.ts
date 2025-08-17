// Supabase Edge Function: process-booking-payment
// This handles the complete booking processing workflow

import { serve }    }
    // Optional: Send SMS notification
    if (bookingData.customerPhone) {
      // SMS functionality would be implemented here
    }st emailSent = emailResponse.ok;

    // Optional: Send SMS notificationm "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingPaymentData {
  paymentIntentId: string;
  paymentStatus: string;
  customerEmail: string;
  customerPhone?: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleName: string;
  vehicleType: string;
  basePrice: number;
  serviceFee: number;
  totalAmount: number;
  flightNumber?: string;
  specialInstructions?: string;
  bookingType: string;
  metadata: Record<string, string>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const bookingData: BookingPaymentData = await req.json()

    // 🔍 DEBUG: Log incoming booking data
    try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email presence
    if (!bookingData.customerEmail || bookingData.customerEmail.trim() === '') {
      console.error('CRITICAL: No customer email provided!');
      throw new Error('Customer email is required for booking confirmation');
    }

    // Create booking record in database
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: null, // We'll implement user linking later
        customer_email: bookingData.customerEmail,
        customer_phone: bookingData.customerPhone,
        pickup_address: bookingData.pickupAddress,
        destination_address: bookingData.destinationAddress,
        pickup_date: bookingData.pickupDate,
        pickup_time: bookingData.pickupTime,
        passengers: bookingData.passengers,
        flight_number: bookingData.flightNumber,
        special_instructions: bookingData.specialInstructions,
        vehicle_type: bookingData.vehicleType,
        vehicle_name: bookingData.vehicleName,
        base_price: bookingData.basePrice,
        service_fee: bookingData.serviceFee,
        total_amount: bookingData.totalAmount,
        stripe_payment_intent_id: bookingData.paymentIntentId,
        stripe_payment_status: bookingData.paymentStatus,
        booking_status: 'confirmed',
        booking_type: bookingData.bookingType,
        booking_source: 'website'
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Database error creating booking:', bookingError);
      throw new Error(`Database error: ${bookingError.message}`)
    }

    // Generate confirmation number
    const confirmationNumber = `NL-${booking.id.slice(0, 8).toUpperCase()}`

    // Send confirmation email via Edge Function
    
    const emailPayload = {
      to: bookingData.customerEmail,
      subject: `Booking Confirmed - Noble Lane Transportation (${confirmationNumber})`,
      type: 'booking-confirmation',
      customerName: 'Valued Customer',
      customerEmail: bookingData.customerEmail,
      bookingId: booking.id,
      pickupAddress: bookingData.pickupAddress,
      destinationAddress: bookingData.destinationAddress,
      pickupDate: new Date(bookingData.pickupDate).toLocaleDateString(),
      pickupTime: bookingData.pickupTime,
      passengers: bookingData.passengers,
      vehicleName: bookingData.vehicleName,
      totalAmount: bookingData.totalAmount,
      confirmationNumber
    };
    
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    })
    
    let emailResponseData;
    try {
      emailResponseData = await emailResponse.json();
    } catch (e) {
      // Email service response was not JSON
    }
    }

    const emailSent = emailResponse.ok;
    console.log(`📧 Email sent successfully: ${emailSent ? '✅ YES' : '❌ NO'}`);

    // 4. Optional: Send SMS notification
    if (bookingData.customerPhone) {
      console.log('📱 SMS would be sent to:', bookingData.customerPhone);
      // Implement SMS sending here using Twilio or similar
    } else {
      console.log('📱 No phone number provided for SMS');
    }

    // 5. Optional: Notify dispatch system
    // You can add webhook calls to your dispatch system here

    const finalResult = { 
      success: true, 
      bookingId: booking.id,
      confirmationNumber,
      emailSent: emailSent
    };

    return new Response(
      JSON.stringify(finalResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing booking payment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
