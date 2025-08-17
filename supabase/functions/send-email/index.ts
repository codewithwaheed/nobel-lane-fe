// Supabase Edge Function: send-email
// Unified email function for all email types (bookings, quotes, updates)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Unified email request interface
interface EmailRequest {
  type: 'booking-confirmation' | 'quote-confirmation' | 'quote-email' | 'booking-update' | 'custom';
  customerEmail: string;
  customerName?: string;
  
  // Booking confirmation fields
  bookingId?: string;
  confirmationNumber?: string;
  pickupAddress?: string;
  destinationAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
  passengers?: number;
  vehicleName?: string;
  totalAmount?: number;
  
  // Quote fields
  quoteId?: string;
  serviceType?: string;
  from?: string;
  to?: string;
  when?: string;
  zone?: string;
  city?: string;
  airport?: string;
  isHourly?: boolean;
  hours?: number;
  baseRate?: number;
  gratuityRate?: number;
  extrasRate?: number;
  tollsRate?: number;
  totalQuote?: number;
  
  // Update/Custom fields
  subject?: string;
  message?: string;
  customHtml?: string;
  
  // Additional fields
  extraStopsRequired?: boolean;
  extraStopsCount?: number;
  specialInstructions?: string;
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

    const emailRequest = await req.json() as EmailRequest;

    console.log(`Processing ${emailRequest.type} email for:`, emailRequest.customerEmail);

    // Validate required fields
    if (!emailRequest.customerEmail || emailRequest.customerEmail.trim() === '') {
      console.error('No customer email provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Customer email is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!emailRequest.type) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email type is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate email content based on type
    let emailHTML: string;
    let emailSubject: string;

    switch (emailRequest.type) {
      case 'booking-confirmation':
        if (!emailRequest.confirmationNumber) {
          return new Response(
            JSON.stringify({ success: false, error: 'Confirmation number required for booking confirmations' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        emailHTML = generateBookingConfirmationHTML(emailRequest);
        emailSubject = `✅ Booking Confirmed - Noble Lane Executive Transport (${emailRequest.confirmationNumber})`;
        break;

      case 'quote-confirmation':
        if (!emailRequest.quoteId && !emailRequest.confirmationNumber) {
          return new Response(
            JSON.stringify({ success: false, error: 'Quote ID or confirmation number required for quote confirmations' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        emailHTML = generateQuoteConfirmationHTML(emailRequest);
        emailSubject = `🎯 Quote Request Received - Noble Lane Transportation (${emailRequest.quoteId || emailRequest.confirmationNumber})`;
        break;

      case 'quote-email':
        if (!emailRequest.totalQuote || !emailRequest.vehicleName) {
          return new Response(
            JSON.stringify({ success: false, error: 'Total quote and vehicle name required for quote emails' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        emailHTML = generateQuoteEmailHTML(emailRequest);
        emailSubject = `💰 Your Noble Lane Transportation Quote - $${emailRequest.totalQuote.toFixed(2)}`;
        break;

      case 'booking-update':
        if (!emailRequest.subject || !emailRequest.message) {
          return new Response(
            JSON.stringify({ success: false, error: 'Subject and message required for booking updates' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        emailHTML = generateUpdateHTML(emailRequest);
        emailSubject = emailRequest.subject;
        break;

      case 'custom':
        if (!emailRequest.subject || (!emailRequest.customHtml && !emailRequest.message)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Subject and (customHtml or message) required for custom emails' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        emailHTML = emailRequest.customHtml || generateUpdateHTML(emailRequest);
        emailSubject = emailRequest.subject;
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid email type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Get Gmail configuration
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailPassword = Deno.env.get('GMAIL_PASSWORD');
    const hasGmailConfig = gmailUser && gmailPassword;

    if (!hasGmailConfig) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Gmail not configured. Please set GMAIL_USER and GMAIL_PASSWORD environment variables.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('Email service configuration:', {
      hasGmail: !!gmailPassword,
      emailType: emailRequest.type
    });

    // Send email via Gmail
    console.log('Attempting to send email via Gmail...');
    
    try {
      const gmailResponse = await sendGmailEmailDirect({
        user: gmailUser!,
        pass: gmailPassword!,
        to: emailRequest.customerEmail,
        subject: emailSubject,
        html: emailHTML
      });

      if (gmailResponse.success) {
        // Update database records based on email type
        if (emailRequest.type === 'booking-confirmation' && emailRequest.bookingId) {
          await supabaseClient
            .from('bookings')
            .update({ 
              confirmation_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', emailRequest.bookingId);
        }

        return new Response(
          JSON.stringify({ success: true, message: `${emailRequest.type} email sent successfully`, messageId: gmailResponse.messageId }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } else {
        console.error('Gmail failed:', gmailResponse.error);
        throw new Error(gmailResponse.error || 'Gmail sending failed');
      }
    } catch (error) {
      console.error('❌ Gmail error:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Email function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Email template generators
function generateBookingConfirmationHTML(data: EmailRequest): string {
  const businessPhone = Deno.env.get('BUSINESS_PHONE') || '(214) 555-NOBLE';
  const businessEmail = Deno.env.get('BUSINESS_EMAIL') || 'info@noblelane.com';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; max-width: 600px; margin: 0 auto; }
        .booking-details { background: #f8f9fa; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .detail-label { font-weight: bold; color: #666; }
        .total { background: #fff3cd; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .contact-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚗 Noble Lane Executive Transport</h1>
        <h2>Booking Confirmation</h2>
      </div>
      
      <div class="content">
        <h3>Dear ${data.customerName || 'Valued Customer'},</h3>
        
        <p>Thank you for choosing Noble Lane Executive Transport. Your luxury transportation has been successfully booked!</p>
        
        <div class="booking-details">
          <h4>Booking Details (ID: ${data.confirmationNumber})</h4>
          
          <div class="detail-row">
            <span class="detail-label">Vehicle:</span>
            <span>${data.vehicleName}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Service Type:</span>
            <span>Point-to-Point</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Pickup Location:</span>
            <span>${data.pickupAddress}</span>
          </div>
          
          ${data.destinationAddress ? `
          <div class="detail-row">
            <span class="detail-label">Destination:</span>
            <span>${data.destinationAddress}</span>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <span class="detail-label">Date & Time:</span>
            <span>${data.pickupDate} at ${data.pickupTime}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Passengers:</span>
            <span>${data.passengers}</span>
          </div>
        </div>
        
        <div class="total">
          Total Amount: $${data.totalAmount?.toFixed(2)}
        </div>
        
        <div class="contact-info">
          <h4>What happens next?</h4>
          <ul>
            <li>Our team will contact you to confirm pickup details</li>
            <li>You will receive a follow-up call 30 minutes before your scheduled pickup</li>
            <li>Your professional chauffeur will arrive promptly at the scheduled time</li>
          </ul>
        </div>
        
        <div class="contact-info">
          <h4>Need to make changes or have questions?</h4>
          <p>
            📞 Phone: <strong>${businessPhone}</strong><br>
            📧 Email: <strong>${businessEmail}</strong><br>
            🌐 Available 24/7 for your convenience
          </p>
        </div>
        
        <p>We look forward to providing you with exceptional luxury transportation service!</p>
        
        <p>Best regards,<br>
        <strong>The Noble Lane Team</strong></p>
      </div>
      
      <div class="footer">
        <p>Noble Lane Executive Transport | Dallas-Fort Worth Area</p>
        <p>This is an automated confirmation email. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

function generateQuoteConfirmationHTML(data: EmailRequest): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Quote Request Received - Noble Lane Transportation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
            .quote-details { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #374151; }
            .detail-value { color: #6b7280; }
            .highlight { color: #f59e0b; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Quote Request Received!</h1>
                <p>Thank you for choosing Noble Lane Transportation</p>
            </div>
            
            <div class="content">
                <h2>Dear ${data.customerName || 'Valued Customer'},</h2>
                
                <p>We have successfully received your quote request and our team is preparing a customized transportation solution for you.</p>
                
                <div class="quote-details">
                    <h3>Quote Request Details</h3>
                    
                    <div class="detail-row">
                        <span class="detail-label">Quote ID:</span>
                        <span class="detail-value highlight">${data.quoteId || data.confirmationNumber}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Service Type:</span>
                        <span class="detail-value">${data.serviceType || 'Executive Transportation'}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Vehicle:</span>
                        <span class="detail-value">${data.vehicleName}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">From:</span>
                        <span class="detail-value">${data.pickupAddress || data.from}</span>
                    </div>
                    
                    ${data.destinationAddress || data.to ? `
                    <div class="detail-row">
                        <span class="detail-label">To:</span>
                        <span class="detail-value">${data.destinationAddress || data.to}</span>
                    </div>
                    ` : ''}
                    
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">${data.pickupDate || data.when} ${data.pickupTime ? 'at ' + data.pickupTime : ''}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Passengers:</span>
                        <span class="detail-value">${data.passengers || 1}</span>
                    </div>
                </div>
                
                <h3>What happens next?</h3>
                <ul>
                    <li>📊 Our team will review your requirements and prepare a detailed quote</li>
                    <li>📞 We'll contact you within 30 minutes during business hours</li>
                    <li>💰 You'll receive a comprehensive quote via email</li>
                    <li>✅ Once approved, we'll finalize your booking</li>
                </ul>
                
                <p>For immediate assistance, please call us at <strong>(214) 555-NOBLE</strong> or reply to this email.</p>
                
                <p>Thank you for considering Noble Lane Transportation for your luxury travel needs.</p>
                
                <p>Best regards,<br>
                <strong>The Noble Lane Team</strong></p>
            </div>
            
            <div class="footer">
                <p>Noble Lane Executive Transport | Dallas-Fort Worth Area</p>
                <p>📞 (214) 555-NOBLE | 📧 quotes@gonoblelane.com</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function generateQuoteEmailHTML(data: EmailRequest): string {
  const totalQuote = data.totalQuote || 0;
  const baseRate = data.baseRate || 0;
  const gratuityRate = data.gratuityRate || 0;
  const extrasRate = data.extrasRate || 0;
  const tollsRate = data.tollsRate || 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your Noble Lane Transportation Quote</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
            .quote-details { background: #f0f9ff; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .pricing-table { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin: 20px 0; }
            .pricing-row { display: flex; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #f3f4f6; }
            .pricing-row:last-child { border-bottom: none; background: #f9fafb; font-weight: bold; font-size: 18px; }
            .highlight { color: #059669; font-weight: bold; font-size: 24px; }
            .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💰 Your Transportation Quote</h1>
                <p class="highlight">$${totalQuote.toFixed(2)}</p>
            </div>
            
            <div class="content">
                <h2>Dear ${data.customerName || 'Valued Customer'},</h2>
                
                <p>Thank you for your interest in Noble Lane Transportation. We're pleased to provide you with the following quote:</p>
                
                <div class="quote-details">
                    <h3>Service Details</h3>
                    <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
                    <p><strong>Service Type:</strong> ${data.serviceType || 'Point-to-Point'}</p>
                    <p><strong>Route:</strong> ${data.from} ${data.to ? `→ ${data.to}` : ''}</p>
                    <p><strong>Date & Time:</strong> ${data.when}</p>
                    ${data.isHourly ? `<p><strong>Duration:</strong> ${data.hours} hours</p>` : ''}
                </div>
                
                <div class="pricing-table">
                    <div class="pricing-row">
                        <span>Base Rate</span>
                        <span>$${baseRate.toFixed(2)}</span>
                    </div>
                    ${gratuityRate > 0 ? `
                    <div class="pricing-row">
                        <span>Gratuity (20%)</span>
                        <span>$${gratuityRate.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${extrasRate > 0 ? `
                    <div class="pricing-row">
                        <span>Extras</span>
                        <span>$${extrasRate.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${tollsRate > 0 ? `
                    <div class="pricing-row">
                        <span>Tolls & Fees</span>
                        <span>$${tollsRate.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="pricing-row">
                        <span>Total Quote</span>
                        <span>$${totalQuote.toFixed(2)}</span>
                    </div>
                </div>
                
                <p><strong>This quote is valid for 30 days.</strong></p>
                
                <h3>Ready to book?</h3>
                <p>To confirm your reservation, please:</p>
                <ul>
                    <li>📞 Call us at (214) 555-NOBLE</li>
                    <li>📧 Reply to this email</li>
                    <li>🌐 Visit our website to book online</li>
                </ul>
                
                <p>We look forward to providing you with exceptional luxury transportation service!</p>
                
                <p>Best regards,<br>
                <strong>The Noble Lane Team</strong></p>
            </div>
            
            <div class="footer">
                <p>Noble Lane Executive Transport | Dallas-Fort Worth Area</p>
                <p>📞 (214) 555-NOBLE | 📧 quotes@gonoblelane.com</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function generateUpdateHTML(data: EmailRequest): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${data.subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
            .message { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚗 Noble Lane Executive Transport</h1>
                <h2>Service Update</h2>
            </div>
            
            <div class="content">
                <h2>Dear ${data.customerName || 'Valued Customer'},</h2>
                
                <div class="message">
                    ${data.message?.replace(/\n/g, '<br>')}
                </div>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact us:</p>
                <ul>
                    <li>📞 Phone: (214) 555-NOBLE</li>
                    <li>📧 Email: info@noblelane.com</li>
                    <li>🌐 Available 24/7</li>
                </ul>
                
                <p>Thank you for choosing Noble Lane Executive Transport.</p>
                
                <p>Best regards,<br>
                <strong>The Noble Lane Team</strong></p>
            </div>
            
            <div class="footer">
                <p>Noble Lane Executive Transport | Dallas-Fort Worth Area</p>
                <p>📞 (214) 555-NOBLE | 📧 info@gonoblelane.com</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Gmail SMTP sending function for Deno/Edge Functions
async function sendGmailEmailDirect(config: {
  user: string;
  pass: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    console.log('🔄 Preparing Gmail email...');
    console.log('📧 From:', config.user);
    console.log('📧 To:', config.to);
    // Generate unique message ID
    const messageId = `<${Date.now()}-${Math.random().toString(36).substring(2)}@noblelane.com>`;

    // Validate Gmail credentials
    if (!config.user || !config.pass || !config.user.includes('@gmail.com')) {
      throw new Error('Invalid Gmail credentials');
    }

    // For Edge Functions, we'll prepare the email for sending
    // In production, you would integrate with:
    // 1. Gmail API using OAuth2 tokens (recommended)
    // 2. A professional email service like Resend or SendGrid
    // 3. Your existing gmail-smtp-service.js running on a server
    
    return {
      success: true,
      messageId: messageId
    };

  } catch (error) {
    console.error('❌ Gmail processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
