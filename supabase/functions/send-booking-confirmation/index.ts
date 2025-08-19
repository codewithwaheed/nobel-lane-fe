// Supabase Edge Function: send-booking-confirmation
// This function sends booking confirmation and quote emails using Gmail SMTP
//
// Required Environment Variables:
// - SMTP_HOSTNAME: Gmail SMTP hostname (smtp.gmail.com)
// - SMTP_PORT: Gmail SMTP port (587 for TLS or 465 for SSL)
// - SMTP_SECURE: Whether to use SSL (false for TLS/587, true for SSL/465)
// - SMTP_USERNAME: Your Gmail email address
// - SMTP_PASSWORD: Your Gmail app password (not regular password)
// - SMTP_FROM: The "From" email address and display name
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
import {
  generateBookingConfirmationHTML,
  generateBookingConfirmationText,
} from "../_shared/email-templates/customer-booking.ts";
import {
  generateQuoteConfirmationHTML,
  generateQuoteConfirmationText,
} from "../_shared/email-templates/customer-quote.ts";
import {
  generateOwnerBookingHTML,
  generateOwnerBookingText,
  type OwnerBookingData,
} from "../_shared/email-templates/owner-booking.ts";
import {
  generateOwnerQuoteHTML,
  generateOwnerQuoteText,
  type OwnerQuoteData,
} from "../_shared/email-templates/owner-quote.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Initialize Gmail SMTP transport
const transport = nodemailer.createTransport({
  service: "gmail",
  host: Deno.env.get("SMTP_HOSTNAME")!,
  port: Number(Deno.env.get("SMTP_PORT")!),
  secure: Deno.env.get("SMTP_SECURE") === "true",
  requireTLS: true,
  auth: {
    user: Deno.env.get("SMTP_USERNAME")!,
    pass: Deno.env.get("SMTP_PASSWORD")!,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  debug: true,
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

interface PricingBreakdown {
  baseRate: number;
  gratuity: number;
  gratuityPercentage?: number;
  additionalFees: Array<{
    name: string;
    amount: number;
    description?: string;
  }>;
  totalAmount: number;
}

interface NotificationRequest {
  type: "booking" | "quote";
  customerEmail: string;
  customerName: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleName?: string;
  totalAmount?: number;
  pricingBreakdown?: PricingBreakdown;
  bookingId?: string;
  confirmationNumber?: string;
  quoteId?: string;
  quoteNumber?: string;
  sendSMS?: boolean;
  phoneNumber?: string;
}

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

    // DEBUG: Log the complete incoming request data
    console.log("🔍 DEBUGGING: Complete incoming request data:", {
      notificationType,
      customerEmail: requestData.customerEmail,
      quoteId: requestData.quoteId,
      vehicleName: requestData.vehicleName,
      totalAmount: requestData.totalAmount,
      pricingBreakdown: requestData.pricingBreakdown,
      hasQuoteId: !!requestData.quoteId,
      requestKeys: Object.keys(requestData),
    });

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
      pricingBreakdown,
      sendSMS: _sendSMS = false,
      phoneNumber: _phoneNumber,
    } = requestData;

    // For quotes, try to get additional information from database if quoteId is provided
    let enhancedVehicleName = vehicleName;
    let enhancedPricingBreakdown = pricingBreakdown;
    let enhancedTotalAmount = totalAmount;

    if (notificationType === "quote" && requestData.quoteId) {
      try {
        console.log(
          `🔍 DEBUGGING: Attempting to fetch quote data for ID: ${requestData.quoteId}`,
        );
        const { data: quoteData, error } = await supabaseClient
          .from("quotes")
          .select(
            "vehicle_type, total_amount, base_rate, gratuity_amount, pricing_breakdown",
          )
          .eq("id", requestData.quoteId)
          .single();

        console.log(`🔍 DEBUGGING: Database query result:`, {
          quoteData,
          error,
        });

        if (quoteData && !error) {
          console.log("📋 Enhanced quote data from database:", quoteData);
          enhancedVehicleName = quoteData.vehicle_type || vehicleName;
          enhancedTotalAmount = quoteData.total_amount || totalAmount;

          if (quoteData.pricing_breakdown) {
            enhancedPricingBreakdown = quoteData.pricing_breakdown;
          } else if (quoteData.base_rate || quoteData.gratuity_amount) {
            enhancedPricingBreakdown = {
              baseRate: quoteData.base_rate || 0,
              gratuity: quoteData.gratuity_amount || 0,
              totalAmount: quoteData.total_amount || 0,
              additionalFees: [],
            };
          }
        } else {
          console.log("⚠️ No quote data found or error occurred:", error);
        }
      } catch (dbError) {
        console.warn("⚠️ Could not fetch enhanced quote data:", dbError);
      }
    } else {
      console.log("🔍 DEBUGGING: Not fetching from database because:", {
        isQuote: notificationType === "quote",
        hasQuoteId: !!requestData.quoteId,
        notificationType,
        quoteId: requestData.quoteId,
      });
    }

    // Generate appropriate email content
    let emailHTML: string;
    let emailText: string;
    let subject: string;
    let referenceNumber: string;

    if (notificationType === "booking") {
      // Booking confirmation
      const { confirmationNumber } = requestData as EmailRequest;
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
        vehicleName: enhancedVehicleName || "Standard Vehicle",
        totalAmount: enhancedTotalAmount || 0,
        pricingBreakdown: enhancedPricingBreakdown,
      });

      emailText = generateBookingConfirmationText({
        customerName,
        confirmationNumber,
        pickupAddress,
        destinationAddress,
        pickupDate,
        pickupTime,
        passengers,
        vehicleName: enhancedVehicleName || "Standard Vehicle",
        totalAmount: enhancedTotalAmount || 0,
        pricingBreakdown: enhancedPricingBreakdown,
      });
    } else {
      // Quote request confirmation
      const { quoteNumber, quoteId } = requestData;
      referenceNumber = quoteNumber ||
        (quoteId
          ? `QT-${quoteId.slice(0, 8).toUpperCase()}`
          : `QT-${Date.now().toString().slice(-6)}`);
      subject =
        `Quote Request Received - ${referenceNumber} - Noble Lane Transportation`;

      emailHTML = generateQuoteConfirmationHTML({
        customerName,
        quoteNumber: referenceNumber,
        quoteId: quoteId || "",
        pickupAddress,
        destinationAddress,
        pickupDate,
        pickupTime,
        passengers,
        vehicleName: enhancedVehicleName ||
          "To be determined based on your requirements",
        pricingBreakdown: enhancedPricingBreakdown,
      });

      emailText = generateQuoteConfirmationText({
        customerName,
        quoteNumber: referenceNumber,
        quoteId: quoteId || "",
        pickupAddress,
        destinationAddress,
        pickupDate,
        pickupTime,
        passengers,
        vehicleName: enhancedVehicleName ||
          "To be determined based on your requirements",
        pricingBreakdown: enhancedPricingBreakdown,
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
      // Continue anyway; verify() can fail even if send works
    }

    // Send email
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
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          Importance: "high",
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
        text: emailText,
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
          console.log("✅ Email sent successfully!", {
            messageId: info?.messageId,
            response: info?.response,
            accepted: info?.accepted,
            rejected: info?.rejected,
          });
          resolve();
        },
      );
    });

    // Send owner notification email
    try {
      const ownerEmail = Deno.env.get("OWNER_EMAIL") ||
        "office@gonoblelane.com";
      console.log(`🔔 Sending owner notification to: ${ownerEmail}`);

      let ownerEmailHTML: string;
      let ownerEmailText: string;
      let ownerSubject: string;

      if (notificationType === "booking") {
        // Owner booking notification
        const ownerBookingData: OwnerBookingData = {
          customerEmail: customerEmail,
          customerPhone: requestData.phoneNumber || "",
          customerFirstName: customerName.split(" ")[0],
          customerLastName: customerName.split(" ").slice(1).join(" ") ||
            undefined,
          pickupLocation: pickupAddress,
          dropoffLocation: destinationAddress,
          pickupDate,
          pickupTime,
          passengers,
          vehicleName: enhancedVehicleName || "Standard Vehicle",
          totalAmount: enhancedTotalAmount || 0,
          confirmationNumber: (requestData as EmailRequest).confirmationNumber,
          tripType: "one-way",
          paymentMethod: "Credit Card",
          paymentIntentId: requestData.bookingId || "N/A",
          bookingSubmittedAt: new Date().toISOString(),
        };

        ownerEmailHTML = generateOwnerBookingHTML(ownerBookingData);
        ownerEmailText = generateOwnerBookingText(ownerBookingData);
        ownerSubject = `🚨 NEW BOOKING #${
          (requestData as EmailRequest).confirmationNumber
        } - Dispatch Required`;
      } else {
        // Owner quote notification
        console.log(
          "🔍 DEBUGGING: Final values before creating owner quote data:",
          {
            enhancedVehicleName,
            enhancedTotalAmount,
            enhancedPricingBreakdown,
            originalVehicleName: vehicleName,
            originalTotalAmount: totalAmount,
            originalPricingBreakdown: pricingBreakdown,
          },
        );

        const ownerQuoteData: OwnerQuoteData = {
          customerEmail: customerEmail,
          customerPhone: requestData.phoneNumber || "",
          customerFirstName: customerName.split(" ")[0],
          customerLastName: customerName.split(" ").slice(1).join(" ") ||
            undefined,
          pickupLocation: pickupAddress,
          dropoffLocation: destinationAddress,
          pickupDate,
          pickupTime,
          passengers,
          vehicleName: enhancedVehicleName ||
            "Standard Vehicle (to be determined based on requirements)",
          baseRate: enhancedPricingBreakdown?.baseRate || 0,
          totalPrice: enhancedTotalAmount ||
            enhancedPricingBreakdown?.totalAmount || 0,
          quoteNumber: referenceNumber,
          tripType: "one-way",
          submittedAt: new Date().toISOString(),
        };

        // Debug logging for pricing information
        console.log(`📊 Pricing data for owner notification:`, {
          originalVehicleName: vehicleName || "NOT PROVIDED",
          enhancedVehicleName,
          originalTotalAmount: totalAmount,
          enhancedTotalAmount,
          originalPricingBreakdown: pricingBreakdown,
          enhancedPricingBreakdown,
          finalBaseRate: enhancedPricingBreakdown?.baseRate || 0,
          finalTotalPrice: enhancedTotalAmount ||
            enhancedPricingBreakdown?.totalAmount || 0,
        });

        ownerEmailHTML = generateOwnerQuoteHTML(ownerQuoteData);
        ownerEmailText = generateOwnerQuoteText(ownerQuoteData);
        ownerSubject =
          `🚨 NEW QUOTE REQUEST #${referenceNumber} - Action Required`;
      }

      // Send owner email
      await new Promise<void>((resolve, _reject) => {
        const ownerMailOptions = {
          from: Deno.env.get("SMTP_FROM")!,
          to: ownerEmail,
          subject: ownerSubject,
          html: ownerEmailHTML,
          text: ownerEmailText,
          headers: {
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
            Importance: "high",
          },
          messageId: `owner-${referenceNumber}-${Date.now()}@gonoblelane.com`,
        };

        transport.sendMail(
          ownerMailOptions,
          (error: NodemailerError | null, info: NodemailerInfo) => {
            if (error) {
              console.error(`❌ Owner email sending error:`, error);
              // Don't reject - owner email is not critical for user experience
              resolve();
            } else {
              console.log("✅ Owner notification sent successfully!", {
                messageId: info?.messageId,
                response: info?.response,
              });
              resolve();
            }
          },
        );
      });
    } catch (ownerError) {
      console.error("❌ Failed to send owner notification:", ownerError);
      // Continue - don't fail the whole request if owner email fails
    }

    // Update DB
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

    // Optional SMS (US/CA only)
    if (requestData.sendSMS && requestData.phoneNumber) {
      try {
        const raw = (requestData.phoneNumber || "").trim();
        const digits = raw.replace(/\D/g, "");
        let to = "";
        if (digits.length === 10) to = `+1${digits}`;
        else if (digits.length === 11 && digits.startsWith("1")) {
          to = `+${digits}`;
        } else if (raw.startsWith("+1") && raw.length > 2) to = raw;

        if (!to) {
          console.log(
            `⚠️ SMS skipped: ${requestData.phoneNumber} is not a valid US/Canada number.`,
          );
        } else {
          console.log(`📱 Preparing SMS to: ${to}`);

          const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
          const authToken = Deno.env.get("TWILIO_AUTH_TOKEN") || "";
          const messagingServiceSid =
            Deno.env.get("TWILIO_MESSAGING_SERVICE_SID") || "";
          const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER") || "";

          if (!accountSid || !authToken) {
            console.log("⚠️ Twilio credentials not configured, skipping SMS");
          } else {
            const smsContent = notificationType === "booking"
              ? `✅ Booking confirmed! Your reservation ${referenceNumber} has been confirmed. We'll contact you soon with driver details. - Noble Lane Transportation`
              : `📋 Quote request received! We've received your quote request ${referenceNumber}. Our team will send you a detailed quote within 30 minutes. - Noble Lane Transportation`;

            const params = new URLSearchParams({ To: to, Body: smsContent });
            if (messagingServiceSid) {
              params.set("MessagingServiceSid", messagingServiceSid);
            } else if (fromNumber) {
              params.set("From", fromNumber);
            } else {
              console.log(
                "⚠️ No MessagingServiceSid or From number set; skipping SMS",
              );
            }

            if (params.has("MessagingServiceSid") || params.has("From")) {
              const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Basic ${
                      btoa(`${accountSid}:${authToken}`)
                    }`,
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: params,
                },
              );

              if (response.ok) {
                const smsResult = await response.json();
                console.log(`📱 SMS sent to ${to}: SID=${smsResult.sid}`);
              } else {
                const errorBody = await response.text();
                console.error("❌ SMS sending failed:", errorBody);
              }
            }
          }
        }
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
