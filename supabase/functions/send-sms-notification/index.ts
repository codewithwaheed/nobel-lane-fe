import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSData {
  to: string;
  message: string;
}

interface QuoteSMSData {
  customerPhone: string;
  customerName: string;
  confirmationNumber: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  vehicleName: string;
}

interface BookingSMSData {
  customerPhone: string;
  customerName: string;
  confirmationNumber: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  vehicleName: string;
  totalAmount: number;
}

interface PickupReminderSMSData {
  customerPhone: string;
  customerName: string;
  pickupAddress: string;
  vehicleName: string;
}

interface CustomMessageSMSData {
  customerPhone: string;
  customMessage: string;
}

interface QuoteDeliverySMSData {
  phone: string;
  vehicleName: string;
  totalQuote: number;
  baseRate: number;
  gratuityRate: number;
  extrasRate: number;
  tollsRate: number;
  hours?: number;
  isHourly: boolean;
  from: string;
  to?: string;
  when: string;
  serviceType: string;
  email: string;
}

// Generate quote SMS message
function generateQuoteSMSMessage(data: QuoteSMSData): string {
  const destination = data.destinationAddress ? ` to ${data.destinationAddress}` : '';
  
  return `🎯 Noble Lane Quote Request Received!

Hi ${data.customerName},

Your quote request has been submitted:
📋 Ref: ${data.confirmationNumber}
📍 From: ${data.pickupAddress}${destination}
📅 ${data.pickupDate} at ${data.pickupTime}
🚗 ${data.vehicleName}

We'll send your personalized quote within 1 hour.

Questions? Call (214) 225-0105
Noble Lane Transportation`;
}

// Generate booking confirmation SMS message
function generateBookingSMSMessage(data: BookingSMSData): string {
  const businessPhone = Deno.env.get('BUSINESS_PHONE') || '(214) 225-0105';
  
  return `🚗 Noble Lane Booking Confirmed!

Hi ${data.customerName}! Your ${data.vehicleName} is booked for ${data.pickupDate} at ${data.pickupTime}.

Pickup: ${data.pickupAddress}
Total: $${data.totalAmount.toFixed(2)}
Booking ID: ${data.confirmationNumber}

We'll call you 30 mins before pickup. Questions? Reply to this message or call ${businessPhone}.

Thank you for choosing Noble Lane! 🌟`;
}

// Generate pickup reminder SMS message
function generatePickupReminderSMSMessage(data: PickupReminderSMSData): string {
  return `🚗 Noble Lane Pickup Reminder

Hi ${data.customerName}! Your ${data.vehicleName} will arrive in 30 minutes.

Pickup location: ${data.pickupAddress}

Your chauffeur will contact you upon arrival. Have a wonderful trip! 🌟

Noble Lane Executive Transport`;
}

// Generate custom message SMS
function generateCustomMessageSMS(data: CustomMessageSMSData): string {
  return `Noble Lane Executive Transport

${data.customMessage}`;
}

// Generate quote delivery SMS message
function generateQuoteDeliverySMSMessage(data: QuoteDeliverySMSData): string {
  // Format date and time
  const formattedDateTime = new Date(data.when).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  
  // Create booking link
  const baseUrl = Deno.env.get('NEXT_PUBLIC_BASE_URL') || Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://gonoblelane.com';
  const bookingLink = `${baseUrl}/booking-review?vehicleName=${encodeURIComponent(data.vehicleName)}&totalQuote=${data.totalQuote}&baseRate=${data.baseRate}&gratuityRate=${data.gratuityRate}&extrasRate=${data.extrasRate}&tollsRate=${data.tollsRate}&hours=${data.hours || 0}&isHourly=${data.isHourly}&from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to || '')}&when=${encodeURIComponent(data.when)}&serviceType=${data.serviceType}&email=${encodeURIComponent(data.email)}&phone=${encodeURIComponent(data.phone)}`;

  return `Noble Lane: Your quote for ${formattedDateTime} executive transport is $${data.totalQuote} (includes 20% gratuity). Valid 48hrs. Confirm: ${bookingLink} Questions? (214) 225-0105`;
}

// Send SMS using Twilio API
async function sendSMS(data: SMSData): Promise<{ success: boolean; error?: string }> {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      console.log('Twilio not configured, SMS would be sent:', data.message);
      return { success: true }; // Return success for now if not configured
    }

    // Clean phone number (remove non-digits except +)
    const cleanPhone = data.to.replace(/[^\d+]/g, '');
    
    // Add +1 if it's a 10-digit US number
    const formattedPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : cleanPhone;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: formattedPhone,
        Body: data.message,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('SMS sent successfully:', result.sid);
      return { success: true };
    } else {
      const error = await response.text();
      console.error('Twilio SMS error:', error);
      return { success: false, error: `Twilio error: ${error}` };
    }

  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const smsData = await req.json()
    
    if (!smsData) {
      return new Response(
        JSON.stringify({ error: 'Invalid SMS data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate required SMS data
    const phoneNumber = smsData.customerPhone || smsData.phone;
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Customer phone is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Additional validation based on SMS type
    if (smsData.customMessage) {
      // Custom message SMS - only needs phone and message
      if (!smsData.customMessage.trim()) {
        return new Response(
          JSON.stringify({ error: 'Custom message cannot be empty' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else if (smsData.baseRate !== undefined) {
      // Quote delivery SMS - needs pricing details
      if (!smsData.vehicleName || !smsData.when || smsData.totalQuote === undefined) {
        return new Response(
          JSON.stringify({ error: 'Quote delivery requires vehicleName, when, and totalQuote' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else if (smsData.totalAmount !== undefined && (!smsData.confirmationNumber || !smsData.pickupDate)) {
      return new Response(
        JSON.stringify({ error: 'Booking confirmation requires confirmationNumber and pickupDate' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else if (!smsData.totalAmount && !smsData.confirmationNumber && (!smsData.pickupAddress || !smsData.vehicleName)) {
      return new Response(
        JSON.stringify({ error: 'Pickup reminder requires pickupAddress and vehicleName' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Determine SMS type and generate appropriate message
    let message: string;
    let smsType: string;
    
    if (smsData.customMessage) {
      // This is a custom message SMS
      message = generateCustomMessageSMS(smsData as CustomMessageSMSData);
      smsType = 'custom message';
    } else if (smsData.baseRate !== undefined && smsData.when) {
      // This is a quote delivery SMS (has baseRate and pricing details)
      message = generateQuoteDeliverySMSMessage(smsData as QuoteDeliverySMSData);
      smsType = 'quote delivery';
    } else if (smsData.totalAmount !== undefined && smsData.pickupDate && smsData.pickupTime) {
      // This is a booking confirmation SMS (has totalAmount, pickupDate, pickupTime)
      message = generateBookingSMSMessage(smsData as BookingSMSData);
      smsType = 'booking confirmation';
    } else if (!smsData.confirmationNumber && smsData.pickupAddress && smsData.vehicleName) {
      // This is a pickup reminder SMS (no confirmationNumber but has pickup details)
      message = generatePickupReminderSMSMessage(smsData as PickupReminderSMSData);
      smsType = 'pickup reminder';
    } else {
      // This is a quote confirmation SMS
      message = generateQuoteSMSMessage(smsData as QuoteSMSData);
      smsType = 'quote confirmation';
    }
    
    // Send SMS
    const result = await sendSMS({
      to: phoneNumber,
      message
    });

    if (result.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${smsType} SMS sent successfully` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error || 'Failed to send SMS' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
