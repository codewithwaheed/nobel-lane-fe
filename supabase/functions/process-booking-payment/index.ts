// Supabase Edge Function: process-booking-payment
// This handles the complete booking processing workflow

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    // 1. Create booking record in database
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
      throw new Error(`Database error: ${bookingError.message}`)
    }

    // 2. Generate confirmation number
    const confirmationNumber = `NL-${booking.id.slice(0, 8).toUpperCase()}`

    // 3. Send confirmation email via Edge Function
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-confirmation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId: booking.id,
        customerEmail: bookingData.customerEmail,
        customerName: 'Valued Customer', // We'll improve this when we collect names
        pickupAddress: bookingData.pickupAddress,
        destinationAddress: bookingData.destinationAddress,
        pickupDate: new Date(bookingData.pickupDate).toLocaleDateString(),
        pickupTime: bookingData.pickupTime,
        passengers: bookingData.passengers,
        vehicleName: bookingData.vehicleName,
        totalAmount: bookingData.totalAmount,
        confirmationNumber
      })
    })

    // 4. Optional: Send SMS notification
    if (bookingData.customerPhone) {
      // Implement SMS sending here using Twilio or similar
      console.log('SMS notification would be sent to:', bookingData.customerPhone)
    }

    // 5. Optional: Notify dispatch system
    // You can add webhook calls to your dispatch system here

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId: booking.id,
        confirmationNumber,
        emailSent: emailResponse.ok
      }),
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
