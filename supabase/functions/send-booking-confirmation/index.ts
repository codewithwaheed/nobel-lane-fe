// Supabase Edge Function: send-booking-confirmation
// This function sends booking confirmation emails using Gmail SMTP
//
// Required Environment Variables:
// - SMTP_HOSTNAME: Gmail SMTP hostname (smtp.gmail.com)
// - SMTP_PORT: Gmail SMTP port (587 for TLS or 465 for SSL)
// - SMTP_SECURE: Whether to use SSL (false for TLS/587, true for SSL/465)
// - SMTP_USERNAME: Your Gmail email address
// - SMTP_PASSWORD: Your Gmail app password (not regular password)
// - SMTP_FROM: The "From" email address and display name
//
// Gmail Setup Instructions:
// 1. Enable 2-factor authentication on your Gmail account
// 2. Generate an "App Password" for this application
// 3. Use the app password (not your regular Gmail password) for SMTP_PASSWORD
//
// Example environment variables:
// SMTP_HOSTNAME=smtp.gmail.com
// SMTP_PORT=587
// SMTP_SECURE=false
// SMTP_USERNAME=your-email@gmail.com
// SMTP_PASSWORD=your-app-password-here
// SMTP_FROM=Noble Lane Transportation <your-email@gmail.com>

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Initialize Gmail SMTP transport
const transport = nodemailer.createTransport({
  service: "gmail", // Use Gmail service preset
  host: Deno.env.get("SMTP_HOSTNAME")!,
  port: Number(Deno.env.get("SMTP_PORT")!),
  secure: Deno.env.get("SMTP_SECURE") === "true", // Proper boolean conversion
  requireTLS: true, // Force TLS
  auth: {
    user: Deno.env.get("SMTP_USERNAME")!,
    pass: Deno.env.get("SMTP_PASSWORD")!,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  socketTimeout: 60000, // 60 seconds
  debug: true, // Enable debug logging
  logger: {
    debug: (message: string) => console.log("📧 SMTP Debug:", message),
    info: (message: string) => console.log("📧 SMTP Info:", message),
    warn: (message: string) => console.warn("📧 SMTP Warning:", message),
    error: (message: string) => console.error("📧 SMTP Error:", message),
  },
});

console.log(
  `Function "send-booking-confirmation" up and running with Gmail SMTP!`,
  `Now supports both booking confirmations and quote notifications.`,
);

// Log configuration (without sensitive data)
console.log("📧 SMTP Configuration:", {
  hostname: Deno.env.get("SMTP_HOSTNAME"),
  port: Deno.env.get("SMTP_PORT"),
  secure: Deno.env.get("SMTP_SECURE"),
  username: Deno.env.get("SMTP_USERNAME"),
  passwordSet: !!Deno.env.get("SMTP_PASSWORD"),
  from: Deno.env.get("SMTP_FROM"),
});

interface NotificationRequest {
  // Notification type
  type: "booking" | "quote";

  // Common fields
  customerEmail: string;
  customerName: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleName?: string;
  totalAmount?: number;

  // Booking-specific fields
  bookingId?: string;
  confirmationNumber?: string;

  // Quote-specific fields
  quoteId?: string;
  quoteNumber?: string;

  // SMS settings (for future Twilio integration)
  sendSMS?: boolean;
  phoneNumber?: string;
}

// Legacy interface for backward compatibility
interface EmailRequest extends NotificationRequest {
  type: "booking";
  bookingId: string;
  confirmationNumber: string;
}

interface NodemailerError extends Error {
  code?: string;
  command?: string;
  response?: string;
}

interface NodemailerInfo {
  messageId?: string;
  response?: string;
  accepted?: string[];
  rejected?: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const requestData = await req.json() as NotificationRequest;

    // Determine notification type (with backward compatibility)
    const notificationType = requestData.type ||
      (requestData.confirmationNumber || requestData.bookingId
        ? "booking"
        : "quote");

    console.log(
      `📧 Processing ${notificationType} notification for:`,
      requestData.customerEmail,
    );

    // Extract common data
    const {
      customerEmail,
      customerName,
      pickupAddress,
      destinationAddress,
      pickupDate,
      pickupTime,
      passengers,
      vehicleName,
      totalAmount,
      sendSMS = false,
      phoneNumber,
    } = requestData;

    // Generate appropriate email content
    let emailHTML: string;
    let emailText: string;
    let subject: string;
    let referenceNumber: string;

    if (notificationType === "booking") {
      // Booking confirmation
      const { confirmationNumber, bookingId } = requestData as EmailRequest;
      referenceNumber = confirmationNumber;
      subject =
        `Booking Confirmed - ${confirmationNumber} - Noble Lane Transportation`;

      emailHTML = generateBookingConfirmationHTML({
        customerName,
        confirmationNumber,
        pickupAddress,
        destinationAddress,
        pickupDate,
        pickupTime,
        passengers,
        vehicleName: vehicleName || "Standard Vehicle",
        totalAmount: totalAmount || 0,
      });

      emailText = generateBookingConfirmationText({
        customerName,
        confirmationNumber,
        pickupAddress,
        destinationAddress,
        pickupDate,
        pickupTime,
        passengers,
        vehicleName: vehicleName || "Standard Vehicle",
        totalAmount: totalAmount || 0,
      });
    } else {
      // Quote request confirmation
      const { quoteNumber, quoteId } = requestData;
      referenceNumber = quoteNumber ||
        `QT-${quoteId?.slice(0, 8).toUpperCase()}` ||
        `QT-${Date.now().toString().slice(-6)}`;
      subject =
        `Quote Request Received - ${referenceNumber} - Noble Lane Transportation`;

      emailHTML = generateQuoteConfirmationHTML({
        customerName,
        quoteNumber: referenceNumber,
        pickupAddress,
        destinationAddress,
        pickupDate,
        pickupTime,
        passengers,
        vehicleName: vehicleName || "To be determined",
      });

      emailText = generateQuoteConfirmationText({
        customerName,
        quoteNumber: referenceNumber,
        pickupAddress,
        destinationAddress,
        pickupDate,
        pickupTime,
        passengers,
        vehicleName: vehicleName || "To be determined",
      });
    }

    // Test SMTP connection before sending
    console.log("🔍 Testing SMTP connection...");
    try {
      await new Promise<void>((resolve, reject) => {
        transport.verify((error: Error | null, success: boolean) => {
          if (error) {
            console.error("❌ SMTP connection failed:", error);
            reject(error);
          } else if (success) {
            console.log("✅ SMTP connection verified successfully");
            resolve();
          } else {
            reject(new Error("SMTP verification returned false"));
          }
        });
      });
    } catch (connectionError) {
      console.error("❌ SMTP connection test failed:", connectionError);
      // Continue with sending attempt anyway, as verify() can sometimes fail even when sending works
    }

    // Send email using Gmail SMTP with improved error handling
    console.log(
      `📧 Attempting to send ${notificationType} email to: ${customerEmail}`,
    );
    console.log(`📧 From address: ${Deno.env.get("SMTP_FROM")}`);

    await new Promise<void>((resolve, reject) => {
      const mailOptions = {
        from: Deno.env.get("SMTP_FROM")!,
        to: customerEmail,
        subject: subject,
        html: emailHTML,
        // Anti-spam and deliverability improvements
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          "Importance": "high",
          "X-Mailer": "Noble Lane Transportation System v1.0",
          "X-Entity-ID": `${notificationType}-${referenceNumber}`,
          "List-Unsubscribe":
            `<mailto:unsubscribe@gonoblelane.com?subject=Unsubscribe-${referenceNumber}>`,
          "List-ID": `Noble Lane Transportation ${
            notificationType === "booking"
              ? "Booking Confirmations"
              : "Quote Requests"
          } <${notificationType}s.gonoblelane.com>`,
        },
        // Text version for better deliverability
        text: emailText,
        // Message ID for better tracking
        messageId: `${referenceNumber}-${Date.now()}@gonoblelane.com`,
      };
      console.log("📧 Mail options:", {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        htmlLength: emailHTML.length,
      });

      transport.sendMail(
        mailOptions,
        (error: NodemailerError | null, info: NodemailerInfo) => {
          if (error) {
            console.error("❌ Email sending error:", error);
            console.error("❌ Error details:", {
              message: error.message,
              code: error.code,
              command: error.command,
              response: error.response,
            });
            return reject(error);
          }

          console.log("✅ Email sent successfully!");
          console.log("📧 Send info:", {
            messageId: info?.messageId,
            response: info?.response,
            accepted: info?.accepted,
            rejected: info?.rejected,
          });
          resolve();
        },
      );
    });

    // Update database record to mark email as sent
    if (notificationType === "booking" && requestData.bookingId) {
      await supabaseClient
        .from("bookings")
        .update({
          confirmation_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestData.bookingId);
    } else if (notificationType === "quote" && requestData.quoteId) {
      await supabaseClient
        .from("quotes")
        .update({
          confirmation_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestData.quoteId);
    }

    // Send SMS notification if requested (US/Canada numbers only)
    if (requestData.sendSMS && requestData.phoneNumber) {
      try {
        // Validate US/Canada phone number format
        const cleanPhone = requestData.phoneNumber.replace(/\D/g, "");
        const isUSCanada = cleanPhone.length === 11 &&
          cleanPhone.startsWith("1");
        const isUS10Digit = cleanPhone.length === 10 &&
          !cleanPhone.startsWith("0") && !cleanPhone.startsWith("1");

        if (!isUSCanada && !isUS10Digit) {
          console.log(
            `⚠️ SMS skipped: ${requestData.phoneNumber} is not a valid US/Canada number. SMS is only available for US/Canada numbers due to Twilio trial limitations.`,
          );
          // Continue with email-only notification
        } else {
          console.log(
            `📱 Sending SMS to validated US/Canada number: ${requestData.phoneNumber}`,
          );

          const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
          const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
          const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

          if (!accountSid || !authToken || !fromNumber) {
            console.log("⚠️ Twilio credentials not configured, skipping SMS");
          } else {
            const smsContent = notificationType === "booking"
              ? `✅ Booking confirmed! Your reservation ${referenceNumber} has been confirmed. We'll contact you soon with driver details. - Noble Lane Transportation`
              : `📋 Quote request received! We've received your quote request ${referenceNumber}. Our team will send you a detailed quote within 30 minutes. - Noble Lane Transportation`;

            const response = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Basic ${
                    btoa(`${accountSid}:${authToken}`)
                  }`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  From: fromNumber,
                  To: requestData.phoneNumber,
                  Body: smsContent,
                }),
              },
            );

            if (response.ok) {
              const smsResult = await response.json();
              console.log(
                `📱 SMS sent successfully to ${requestData.phoneNumber}: ${smsResult.sid}`,
              );
            } else {
              const error = await response.text();
              console.error(`❌ SMS sending failed: ${error}`);
            }
          }
        } // Close the US validation else block
      } catch (error) {
        console.error("❌ SMS sending error:", error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${
          notificationType === "booking"
            ? "Booking confirmation"
            : "Quote notification"
        } sent successfully via email${
          requestData.sendSMS && requestData.phoneNumber ? " and SMS" : ""
        }`,
        referenceNumber,
        type: notificationType,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error("Function error:", error);
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

interface BookingEmailData {
  customerName: string;
  confirmationNumber: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleName: string;
  totalAmount: number;
}

interface QuoteEmailData {
  customerName: string;
  quoteNumber: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleName: string;
}

function generateBookingConfirmationHTML(data: BookingEmailData): string {
  // Get the domain URL for logo - use production domain or fallback to localhost for testing
  const baseUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") ||
    "https://gonoblelane.com" || "http://localhost:3000";
  const logoUrl = `${baseUrl}/logo.png`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - Noble Lane Transportation</title>
        <style>
            /* Reset and base styles */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #1f2937; 
                background-color: #f9fafb;
                margin: 0;
                padding: 20px;
            }
            
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .header { 
                background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="grain" width="100" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grain)"/></svg>') repeat;
                opacity: 0.1;
            }
            
            .logo-container {
                position: relative;
                z-index: 1;
                margin-bottom: 20px;
            }
            
            .logo { 
                height: 60px; 
                width: auto; 
                margin-bottom: 15px;
                filter: brightness(0) invert(1);
            }
            
            .header h1 { 
                font-size: 28px; 
                font-weight: 700; 
                margin: 0 0 10px 0;
                position: relative;
                z-index: 1;
            }
            
            .header p { 
                font-size: 16px; 
                opacity: 0.95;
                position: relative;
                z-index: 1;
                margin: 0;
            }
            
            .content { 
                padding: 40px 30px;
                background: #ffffff;
            }
            
            .greeting { 
                font-size: 18px; 
                font-weight: 600; 
                margin-bottom: 20px; 
                color: #1f2937;
            }
            
            .intro-text {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 30px;
                line-height: 1.7;
            }
            
            .booking-details { 
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                padding: 25px; 
                border-radius: 12px; 
                margin: 30px 0;
                border: 1px solid #e2e8f0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .booking-details h3 { 
                font-size: 18px; 
                font-weight: 700; 
                margin-bottom: 20px; 
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .detail-row { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start;
                margin: 15px 0; 
                padding: 12px 0; 
                border-bottom: 1px solid #e5e7eb;
            }
            
            .detail-row:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            
            .detail-row strong { 
                color: #374151; 
                font-weight: 600;
            }
            
            .detail-value {
                text-align: right;
                max-width: 60%;
                word-wrap: break-word;
            }
            
            .highlight { 
                color: #f59e0b; 
                font-weight: 700;
                font-size: 18px;
            }
            
            .confirmation-number {
                background: #fef3c7;
                color: #92400e;
                padding: 8px 16px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-weight: 700;
                font-size: 16px;
                letter-spacing: 1px;
            }
            
            .next-steps { 
                background: #eff6ff;
                border: 1px solid #dbeafe;
                border-radius: 12px; 
                padding: 25px; 
                margin: 30px 0;
            }
            
            .next-steps h3 { 
                font-size: 18px; 
                font-weight: 700; 
                margin-bottom: 20px; 
                color: #1e40af;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .next-steps ul { 
                list-style: none; 
                padding: 0; 
            }
            
            .next-steps li { 
                margin: 12px 0; 
                padding: 8px 0;
                position: relative;
                padding-left: 25px;
            }
            
            .next-steps li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
                font-size: 14px;
            }
            
            .footer {
                background: #1f2937;
                color: #d1d5db;
                padding: 30px;
                text-align: center;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .footer a {
                color: #f59e0b;
                text-decoration: none;
            }
            
            .footer a:hover {
                text-decoration: underline;
            }
            
            .contact-info {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #374151;
            }
            
            .social-links {
                margin-top: 15px;
            }
            
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #9ca3af;
                text-decoration: none;
                font-size: 12px;
            }
            
            /* Responsive design */
            @media only screen and (max-width: 600px) {
                body { padding: 10px; }
                .header { padding: 30px 20px; }
                .content { padding: 30px 20px; }
                .booking-details { padding: 20px; }
                .next-steps { padding: 20px; }
                .footer { padding: 25px 20px; }
                .detail-row { flex-direction: column; gap: 8px; }
                .detail-value { text-align: left; max-width: 100%; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-container">
                    <img src="${logoUrl}" alt="Noble Lane Transportation Logo" class="logo">
                </div>
                <h1>🎉 Booking Confirmed!</h1>
                <p>Thank you for choosing Noble Lane Transportation</p>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${data.customerName},</div>
                <div class="intro-text">
                    We're excited to confirm your luxury transportation booking. Your reservation has been successfully processed and is now confirmed in our system.
                </div>
                
                <div class="booking-details">
                    <h3>📋 Booking Details</h3>
                    <div class="detail-row">
                        <span><strong>Confirmation Number:</strong></span>
                        <span class="detail-value confirmation-number">${data.confirmationNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Pickup Location:</strong></span>
                        <span class="detail-value">${data.pickupAddress}</span>
                    </div>
                    ${
    data.destinationAddress
      ? `
                    <div class="detail-row">
                        <span><strong>Destination:</strong></span>
                        <span class="detail-value">${data.destinationAddress}</span>
                    </div>
                    `
      : ""
  }
                    <div class="detail-row">
                        <span><strong>Date & Time:</strong></span>
                        <span class="detail-value">${data.pickupDate} at ${data.pickupTime}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Passengers:</strong></span>
                        <span class="detail-value">${data.passengers} passenger${
    data.passengers === 1 ? "" : "s"
  }</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Vehicle:</strong></span>
                        <span class="detail-value">${data.vehicleName}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Total Amount:</strong></span>
                        <span class="detail-value highlight">$${
    data.totalAmount.toFixed(2)
  }</span>
                    </div>
                </div>

                <div class="next-steps">
                    <h3>🚗 What Happens Next?</h3>
                    <ul>
                        <li><strong>24-48 hours before:</strong> We'll contact you to confirm pickup details and provide your chauffeur's information</li>
                        <li><strong>15 minutes early:</strong> Your professional, uniformed chauffeur will arrive at the specified location</li>
                        <li><strong>Real-time updates:</strong> You'll receive SMS notifications with vehicle and driver details</li>
                        <li><strong>24/7 support:</strong> Our customer service team is available for any questions or changes</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <div>
                    <strong>Noble Lane Transportation</strong><br>
                    Premium Luxury Transportation Services
                </div>
                <div class="contact-info">
                    📞 <a href="tel:+12142250105">Call us anytime</a> | 
                    📧 <a href="mailto:office@gonoblelane.com">office@gonoblelane.com</a> | 
                    🌐 <a href="https://gonoblelane.com">gonoblelane.com</a>
                </div>
                <div class="social-links">
                    <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">LinkedIn</a>
                </div>
                <div style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                    This is an automated message. Please do not reply to this email.<br>
                    If you need assistance, please contact our support team.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

function generateBookingConfirmationText(data: BookingEmailData): string {
  return `
BOOKING CONFIRMED - Noble Lane Transportation

Hello ${data.customerName},

Thank you for choosing Noble Lane Transportation! Your luxury transportation booking has been successfully confirmed.

BOOKING DETAILS:
================
Confirmation Number: ${data.confirmationNumber}
Pickup Location: ${data.pickupAddress}${
    data.destinationAddress ? `\nDestination: ${data.destinationAddress}` : ""
  }
Date & Time: ${data.pickupDate} at ${data.pickupTime}
Passengers: ${data.passengers} passenger${data.passengers === 1 ? "" : "s"}
Vehicle: ${data.vehicleName}
Total Amount: $${data.totalAmount.toFixed(2)}

WHAT HAPPENS NEXT:
==================
✓ 24-48 hours before: We'll contact you to confirm pickup details and provide your chauffeur's information
✓ 15 minutes early: Your professional, uniformed chauffeur will arrive at the specified location
✓ Real-time updates: You'll receive SMS notifications with vehicle and driver details
✓ 24/7 support: Our customer service team is available for any questions or changes

CONTACT INFORMATION:
====================
Phone: Call us anytime
Email: office@gonoblelane.com
Website: https://gonoblelane.com

Thank you for choosing Noble Lane Transportation - your premium luxury transportation service.

This is an automated message. Please do not reply to this email.
If you need assistance, please contact our support team.

Noble Lane Transportation
Premium Luxury Transportation Services
  `;
}

function generateQuoteConfirmationHTML(data: QuoteEmailData): string {
  // Get the domain URL for logo - use production domain or fallback to localhost for testing
  const baseUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") ||
    "https://gonoblelane.com" || "http://localhost:3000";
  const logoUrl = `${baseUrl}/logo.png`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quote Request Received - Noble Lane Transportation</title>
        <style>
            /* Reset and base styles */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #1f2937; 
                background-color: #f9fafb;
                margin: 0;
                padding: 20px;
            }
            
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .header { 
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="grain" width="100" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grain)"/></svg>') repeat;
                opacity: 0.1;
            }
            
            .logo-container {
                position: relative;
                z-index: 1;
                margin-bottom: 20px;
            }
            
            .logo { 
                height: 60px; 
                width: auto; 
                margin-bottom: 15px;
                filter: brightness(0) invert(1);
            }
            
            .header h1 { 
                font-size: 28px; 
                font-weight: 700; 
                margin: 0 0 10px 0;
                position: relative;
                z-index: 1;
            }
            
            .header p { 
                font-size: 16px; 
                opacity: 0.95;
                position: relative;
                z-index: 1;
                margin: 0;
            }
            
            .content { 
                padding: 40px 30px;
                background: #ffffff;
            }
            
            .greeting { 
                font-size: 18px; 
                font-weight: 600; 
                margin-bottom: 20px; 
                color: #1f2937;
            }
            
            .intro-text {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 30px;
                line-height: 1.7;
            }
            
            .quote-details { 
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                padding: 25px; 
                border-radius: 12px; 
                margin: 30px 0;
                border: 1px solid #bfdbfe;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .quote-details h3 { 
                font-size: 18px; 
                font-weight: 700; 
                margin-bottom: 20px; 
                color: #1e40af;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .detail-row { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start;
                margin: 15px 0; 
                padding: 12px 0; 
                border-bottom: 1px solid #e5e7eb;
            }
            
            .detail-row:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            
            .detail-row strong { 
                color: #374151; 
                font-weight: 600;
            }
            
            .detail-value {
                text-align: right;
                max-width: 60%;
                word-wrap: break-word;
            }
            
            .highlight { 
                color: #3b82f6; 
                font-weight: 700;
                font-size: 18px;
            }
            
            .quote-number {
                background: #dbeafe;
                color: #1e40af;
                padding: 8px 16px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-weight: 700;
                font-size: 16px;
                letter-spacing: 1px;
            }
            
            .next-steps { 
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 12px; 
                padding: 25px; 
                margin: 30px 0;
            }
            
            .next-steps h3 { 
                font-size: 18px; 
                font-weight: 700; 
                margin-bottom: 20px; 
                color: #166534;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .next-steps ul { 
                list-style: none; 
                padding: 0; 
            }
            
            .next-steps li { 
                margin: 12px 0; 
                padding: 8px 0;
                position: relative;
                padding-left: 25px;
            }
            
            .next-steps li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
                font-size: 14px;
            }
            
            .footer {
                background: #1f2937;
                color: #d1d5db;
                padding: 30px;
                text-align: center;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .footer a {
                color: #3b82f6;
                text-decoration: none;
            }
            
            .footer a:hover {
                text-decoration: underline;
            }
            
            .contact-info {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #374151;
            }
            
            .social-links {
                margin-top: 15px;
            }
            
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #9ca3af;
                text-decoration: none;
                font-size: 12px;
            }
            
            /* Responsive design */
            @media only screen and (max-width: 600px) {
                body { padding: 10px; }
                .header { padding: 30px 20px; }
                .content { padding: 30px 20px; }
                .quote-details { padding: 20px; }
                .next-steps { padding: 20px; }
                .footer { padding: 25px 20px; }
                .detail-row { flex-direction: column; gap: 8px; }
                .detail-value { text-align: left; max-width: 100%; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-container">
                    <img src="${logoUrl}" alt="Noble Lane Transportation Logo" class="logo">
                </div>
                <h1>📋 Quote Request Received!</h1>
                <p>We're preparing your custom transportation quote</p>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${data.customerName},</div>
                <div class="intro-text">
                    Thank you for your interest in Noble Lane Transportation! We have received your quote request and our team is now preparing a personalized quote for your luxury transportation needs.
                </div>
                
                <div class="quote-details">
                    <h3>📋 Quote Request Details</h3>
                    <div class="detail-row">
                        <span><strong>Quote Number:</strong></span>
                        <span class="detail-value quote-number">${data.quoteNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Pickup Location:</strong></span>
                        <span class="detail-value">${data.pickupAddress}</span>
                    </div>
                    ${
    data.destinationAddress
      ? `
                    <div class="detail-row">
                        <span><strong>Destination:</strong></span>
                        <span class="detail-value">${data.destinationAddress}</span>
                    </div>
                    `
      : ""
  }
                    <div class="detail-row">
                        <span><strong>Date & Time:</strong></span>
                        <span class="detail-value">${data.pickupDate} at ${data.pickupTime}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Passengers:</strong></span>
                        <span class="detail-value">${data.passengers} passenger${
    data.passengers === 1 ? "" : "s"
  }</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Vehicle Type:</strong></span>
                        <span class="detail-value">${data.vehicleName}</span>
                    </div>
                </div>

                <div class="next-steps">
                    <h3>⏱️ What Happens Next?</h3>
                    <ul>
                        <li><strong>Within 2 hours:</strong> Our team will review your request and prepare a detailed quote</li>
                        <li><strong>Personal consultation:</strong> We may contact you to discuss specific requirements or preferences</li>
                        <li><strong>Custom pricing:</strong> You'll receive a personalized quote via email with transparent pricing</li>
                        <li><strong>Easy booking:</strong> If you're satisfied with the quote, you can book directly through our secure system</li>
                    </ul>
                </div>

                <div style="background: #fffbeb; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                    <h4 style="color: #92400e; margin: 0 0 10px 0;">Questions or Special Requests?</h4>
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                        Our customer service team is available 24/7 to assist you. Don't hesitate to reach out!
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <div>
                    <strong>Noble Lane Transportation</strong><br>
                    Premium Luxury Transportation Services
                </div>
                <div class="contact-info">
                    📞 <a href="tel:+12142250105">Call us anytime</a> | 
                    📧 <a href="mailto:office@gonoblelane.com">office@gonoblelane.com</a> | 
                    🌐 <a href="https://gonoblelane.com">gonoblelane.com</a>
                </div>
                <div class="social-links">
                    <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">LinkedIn</a>
                </div>
                <div style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                    This is an automated message. Please do not reply to this email.<br>
                    If you need assistance, please contact our quotes team.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

function generateQuoteConfirmationText(data: QuoteEmailData): string {
  return `
QUOTE REQUEST RECEIVED - Noble Lane Transportation

Hello ${data.customerName},

Thank you for your interest in Noble Lane Transportation! We have received your quote request and our team is now preparing a personalized quote for your luxury transportation needs.

QUOTE REQUEST DETAILS:
=======================
Quote Number: ${data.quoteNumber}
Pickup Location: ${data.pickupAddress}${
    data.destinationAddress ? `\nDestination: ${data.destinationAddress}` : ""
  }
Date & Time: ${data.pickupDate} at ${data.pickupTime}
Passengers: ${data.passengers} passenger${data.passengers === 1 ? "" : "s"}
Vehicle Type: ${data.vehicleName}

WHAT HAPPENS NEXT:
==================
✓ Within 2 hours: Our team will review your request and prepare a detailed quote
✓ Personal consultation: We may contact you to discuss specific requirements or preferences
✓ Custom pricing: You'll receive a personalized quote via email with transparent pricing
✓ Easy booking: If you're satisfied with the quote, you can book directly through our secure system

QUESTIONS OR SPECIAL REQUESTS?
===============================
Our customer service team is available 24/7 to assist you. Don't hesitate to reach out!

CONTACT INFORMATION:
====================
Phone: Call us anytime
Email: office@gonoblelane.com
Website: https://gonoblelane.com

Thank you for considering Noble Lane Transportation - your premium luxury transportation service.

This is an automated message. Please do not reply to this email.
If you need assistance, please contact our quotes team.

Noble Lane Transportation
Premium Luxury Transportation Services
  `;
}
