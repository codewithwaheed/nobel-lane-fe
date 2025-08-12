// Supabase Edge Function: send-booking-confirmation
// This should be deployed as a Supabase Edge Function for better performance and reliability

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleName: string;
  totalAmount: number;
  confirmationNumber: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { bookingId, customerEmail, customerName, pickupAddress, destinationAddress, 
            pickupDate, pickupTime, passengers, vehicleName, totalAmount, confirmationNumber } = await req.json()

    // Generate email HTML
    const emailHTML = generateBookingConfirmationHTML({
      customerName,
      confirmationNumber,
      pickupAddress,
      destinationAddress,
      pickupDate,
      pickupTime,
      passengers,
      vehicleName,
      totalAmount
    });

    // Send email using your preferred email service
    // Example with Resend (you can replace with your email provider)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Noble Lane Transportation <bookings@gonoblelane.com>',
        to: customerEmail,
        subject: `Booking Confirmed - ${confirmationNumber}`,
        html: emailHTML,
      }),
    });

    if (emailResponse.ok) {
      // Update booking record to mark email as sent
      await supabaseClient
        .from('bookings')
        .update({ 
          confirmation_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      throw new Error('Failed to send email');
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function generateBookingConfirmationHTML(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Booking Confirmation - Noble Lane Transportation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .booking-details { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .highlight { color: #f59e0b; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Booking Confirmed!</h1>
                <p>Thank you for choosing Noble Lane Transportation</p>
            </div>
            
            <div class="content">
                <h2>Hello ${data.customerName},</h2>
                <p>Your luxury transportation has been successfully booked and confirmed.</p>
                
                <div class="booking-details">
                    <h3>📋 Booking Details</h3>
                    <div class="detail-row">
                        <span><strong>Confirmation Number:</strong></span>
                        <span class="highlight">${data.confirmationNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Pickup Address:</strong></span>
                        <span>${data.pickupAddress}</span>
                    </div>
                    ${data.destinationAddress ? `
                    <div class="detail-row">
                        <span><strong>Destination:</strong></span>
                        <span>${data.destinationAddress}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span><strong>Date & Time:</strong></span>
                        <span>${data.pickupDate} at ${data.pickupTime}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Passengers:</strong></span>
                        <span>${data.passengers}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Vehicle:</strong></span>
                        <span>${data.vehicleName}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Total Amount:</strong></span>
                        <span class="highlight">$${data.totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <h3>🚗 What Happens Next?</h3>
                <ul>
                    <li><strong>24 hours before:</strong> We'll contact you to confirm pickup details</li>
                    <li><strong>15 minutes early:</strong> Your professional chauffeur will arrive</li>
                    <li><strong>Real-time updates:</strong> You'll receive SMS updates</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `;
}
