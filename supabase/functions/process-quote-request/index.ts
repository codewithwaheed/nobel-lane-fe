import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuoteData {
  customerEmail: string;
  customerPhone?: string;
  customerFirstName?: string;
  customerLastName?: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  flightNumber?: string;
  specialInstructions?: string;
  vehicleType: string;
  vehicleName: string;
  basePrice: number;
  extraStopsRequired?: boolean;
  extraStopsCount?: number;
  bookingSource?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: requestData, error: parseError } = await req.json().catch(() => ({ data: null, error: 'Invalid JSON' }))
    
    if (parseError || !requestData) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const quoteData: QuoteData = requestData

    // Validate required fields
    if (!quoteData.customerEmail && !quoteData.customerPhone) {
      return new Response(
        JSON.stringify({ error: 'Either email or phone number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!quoteData.pickupAddress || !quoteData.pickupDate || !quoteData.pickupTime) {
      return new Response(
        JSON.stringify({ error: 'Trip details (pickup address, date, time) are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!quoteData.vehicleType || !quoteData.vehicleName) {
      return new Response(
        JSON.stringify({ error: 'Vehicle selection is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create quote record in database
    const quoteRecord = {
      customer_email: quoteData.customerEmail,
      customer_phone: quoteData.customerPhone || null,
      customer_first_name: quoteData.customerFirstName || null,
      customer_last_name: quoteData.customerLastName || null,
      
      pickup_address: quoteData.pickupAddress,
      destination_address: quoteData.destinationAddress || null,
      pickup_date: quoteData.pickupDate,
      pickup_time: quoteData.pickupTime,
      passengers: quoteData.passengers,
      flight_number: quoteData.flightNumber || null,
      special_instructions: quoteData.specialInstructions || null,
      
      vehicle_type: quoteData.vehicleType,
      vehicle_name: quoteData.vehicleName,
      base_price: quoteData.basePrice,
      service_fee: 0,
      total_amount: 0,
      
      stripe_payment_intent_id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stripe_payment_status: 'quote_pending',
      payment_method: 'quote',
      currency: 'usd',
      
      booking_status: 'pending',
      booking_type: 'quote',
      booking_source: quoteData.bookingSource || 'website',
    }

    const { data: quote, error: dbError } = await supabaseClient
      .from('bookings')
      .insert(quoteRecord)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to save quote request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const confirmationNumber = `NL-Q-${quote.id.slice(0, 8).toUpperCase()}`

    // Send confirmation email if email is provided
    if (quoteData.customerEmail) {
      try {
        const emailData = {
          customerEmail: quoteData.customerEmail,
          customerName: quoteData.customerFirstName || 'Valued Customer',
          quoteId: quote.id,
          pickupAddress: quoteData.pickupAddress,
          destinationAddress: quoteData.destinationAddress || '',
          pickupDate: new Date(quoteData.pickupDate).toLocaleDateString(),
          pickupTime: quoteData.pickupTime,
          passengers: quoteData.passengers,
          vehicleName: quoteData.vehicleName,
          confirmationNumber,
          extraStopsRequired: quoteData.extraStopsRequired || false,
          extraStopsCount: quoteData.extraStopsCount || 0,
          specialInstructions: quoteData.specialInstructions || ''
        }

        // Call unified email sending function
        const emailResponse = await supabaseClient.functions.invoke('send-email', {
          body: {
            to: emailData.customerEmail,
            subject: `🎯 Quote Request Received - Noble Lane Executive Transport (${confirmationNumber})`,
            type: 'quote-confirmation',
            customerName: emailData.customerName,
            confirmationNumber: emailData.confirmationNumber,
            pickupAddress: emailData.pickupAddress,
            destinationAddress: emailData.destinationAddress,
            pickupDate: emailData.pickupDate,
            pickupTime: emailData.pickupTime,
            passengers: emailData.passengers,
            vehicleName: emailData.vehicleName,
            extraStopsRequired: emailData.extraStopsRequired,
            extraStopsCount: emailData.extraStopsCount,
            specialInstructions: emailData.specialInstructions,
            quoteId: emailData.quoteId
          }
        })

        if (emailResponse.error) {
          console.error('Email sending failed:', emailResponse.error)
          // Don't fail the request if email fails, quote is already saved
        }
      } catch (emailError) {
        console.error('Email error:', emailError)
        // Continue without failing the request
      }
    }

    // Send SMS confirmation if phone is provided
    if (quoteData.customerPhone) {
      try {
        const smsData = {
          customerPhone: quoteData.customerPhone,
          customerName: quoteData.customerFirstName || 'Valued Customer',
          confirmationNumber,
          pickupAddress: quoteData.pickupAddress,
          destinationAddress: quoteData.destinationAddress || '',
          pickupDate: new Date(quoteData.pickupDate).toLocaleDateString(),
          pickupTime: quoteData.pickupTime,
          vehicleName: quoteData.vehicleName
        }

        // Call SMS sending edge function
        const smsResponse = await supabaseClient.functions.invoke('send-sms-notification', {
          body: smsData
        })

        if (smsResponse.error) {
          console.error('SMS sending failed:', smsResponse.error)
          // Don't fail the request if SMS fails, quote is already saved
        } else {
          console.log('Quote confirmation SMS sent successfully')
        }
      } catch (smsError) {
        console.error('SMS error:', smsError)
        // Continue without failing the request
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        quoteId: quote.id,
        confirmationNumber,
        message: 'Quote request submitted successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing quote request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
