// SMS service for sending quote and booking notifications via Twilio
// Uses Twilio REST API for SMS delivery

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

// Generate booking SMS message
function generateBookingSMSMessage(data: BookingSMSData): string {
  // Get business phone from environment or use default
  const businessPhone = process.env.BUSINESS_PHONE || '(214) 225-0105';
  
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://gonoblelane.com';
  const bookingLink = `${baseUrl}/booking-review?vehicleName=${encodeURIComponent(data.vehicleName)}&totalQuote=${data.totalQuote}&baseRate=${data.baseRate}&gratuityRate=${data.gratuityRate}&extrasRate=${data.extrasRate}&tollsRate=${data.tollsRate}&hours=${data.hours || 0}&isHourly=${data.isHourly}&from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to || '')}&when=${encodeURIComponent(data.when)}&serviceType=${data.serviceType}&email=${encodeURIComponent(data.email)}&phone=${encodeURIComponent(data.phone)}`;

  return `Noble Lane: Your quote for ${formattedDateTime} executive transport is $${data.totalQuote} (includes 20% gratuity). Valid 48hrs. Confirm: ${bookingLink} Questions? (214) 225-0105`;
}

// Send SMS using Twilio API
export async function sendSMS(data: SMSData): Promise<{ success: boolean; error?: string }> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

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
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send quote confirmation SMS
export async function sendQuoteConfirmationSMS(data: QuoteSMSData): Promise<boolean> {
  try {
    const message = generateQuoteSMSMessage(data);
    const result = await sendSMS({
      to: data.customerPhone,
      message
    });
    
    return result.success;
  } catch (error) {
    console.error('❌ Failed to send quote confirmation SMS:', error);
    return false;
  }
}

// Send booking confirmation SMS
export async function sendBookingConfirmationSMS(data: BookingSMSData): Promise<boolean> {
  try {
    const message = generateBookingSMSMessage(data);
    const result = await sendSMS({
      to: data.customerPhone,
      message
    });
    
    return result.success;
  } catch (error) {
    console.error('❌ Failed to send booking confirmation SMS:', error);
    return false;
  }
}

// Send pickup reminder SMS
export async function sendPickupReminderSMS(data: PickupReminderSMSData): Promise<boolean> {
  try {
    const message = generatePickupReminderSMSMessage(data);
    const result = await sendSMS({
      to: data.customerPhone,
      message
    });
    
    return result.success;
  } catch (error) {
    console.error('❌ Failed to send pickup reminder SMS:', error);
    return false;
  }
}

// Send custom message SMS
export async function sendCustomMessageSMS(phone: string, message: string): Promise<boolean> {
  try {
    const formattedMessage = `Noble Lane Executive Transport

${message}`;
    
    const result = await sendSMS({
      to: phone,
      message: formattedMessage
    });
    
    return result.success;
  } catch (error) {
    console.error('❌ Failed to send custom SMS:', error);
    return false;
  }
}

// Send quote delivery SMS
export async function sendQuoteDeliverySMS(data: QuoteDeliverySMSData): Promise<boolean> {
  try {
    const message = generateQuoteDeliverySMSMessage(data);
    const result = await sendSMS({
      to: data.phone,
      message
    });
    
    return result.success;
  } catch (error) {
    console.error('❌ Failed to send quote delivery SMS:', error);
    return false;
  }
}

export type { QuoteSMSData, BookingSMSData, PickupReminderSMSData, QuoteDeliverySMSData, SMSData };
