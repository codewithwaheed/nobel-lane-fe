// Email service for sending booking confirmations and notifications
// You can replace this with your preferred email service (SendGrid, Resend, Nodemailer, etc.)

interface BookingEmailData {
  customerEmail: string;
  customerName: string;
  bookingId: string;
  paymentIntentId: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleName: string;
  totalAmount: number;
  confirmationNumber: string;
}

interface PaymentFailureEmailData {
  customerEmail: string;
  paymentIntentId: string;
  failureReason?: string;
  amount: number;
}

// Simple email template for booking confirmation
function generateBookingConfirmationHTML(data: BookingEmailData): string {
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
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
            .booking-details { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #374151; }
            .detail-value { color: #6b7280; }
            .highlight { color: #f59e0b; font-weight: bold; }
            .button { background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
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
                <p>Your luxury transportation has been successfully booked and confirmed. We're excited to provide you with exceptional service.</p>
                
                <div class="booking-details">
                    <h3>📋 Booking Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Confirmation Number:</span>
                        <span class="detail-value highlight">${data.confirmationNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Pickup Address:</span>
                        <span class="detail-value">${data.pickupAddress}</span>
                    </div>
                    ${data.destinationAddress ? `
                    <div class="detail-row">
                        <span class="detail-label">Destination:</span>
                        <span class="detail-value">${data.destinationAddress}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">${data.pickupDate} at ${data.pickupTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Passengers:</span>
                        <span class="detail-value">${data.passengers}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Vehicle:</span>
                        <span class="detail-value">${data.vehicleName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value highlight">$${data.totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <h3>🚗 What Happens Next?</h3>
                <ul>
                    <li><strong>24 hours before:</strong> We'll contact you to confirm pickup details</li>
                    <li><strong>15 minutes early:</strong> Your professional chauffeur will arrive</li>
                    <li><strong>Real-time updates:</strong> You'll receive SMS updates on your chauffeur's location</li>
                </ul>

                <h3>📞 Need to Make Changes?</h3>
                <p>Contact us at least 24 hours before your trip:</p>
                <ul>
                    <li>Phone: <a href="tel:+12142250105">(214) 225-0105</a></li>
                    <li>Email: <a href="mailto:info@gonoblelane.com">info@gonoblelane.com</a></li>
                </ul>
            </div>

            <div class="footer">
                <p><strong>Noble Lane Transportation</strong></p>
                <p>Premium luxury transportation services</p>
                <p>Dallas, TX | (214) 225-0105 | info@gonoblelane.com</p>
                <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
                    Booking ID: ${data.bookingId} | Payment ID: ${data.paymentIntentId}
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Simple text version for email clients that don't support HTML
function generateBookingConfirmationText(data: BookingEmailData): string {
  return `
BOOKING CONFIRMED - Noble Lane Transportation

Hello ${data.customerName},

Your luxury transportation has been successfully booked and confirmed.

BOOKING DETAILS:
Confirmation Number: ${data.confirmationNumber}
Pickup Address: ${data.pickupAddress}
${data.destinationAddress ? `Destination: ${data.destinationAddress}\n` : ''}Date & Time: ${data.pickupDate} at ${data.pickupTime}
Passengers: ${data.passengers}
Vehicle: ${data.vehicleName}
Total Amount: $${data.totalAmount.toFixed(2)}

WHAT HAPPENS NEXT:
- 24 hours before: We'll contact you to confirm pickup details
- 15 minutes early: Your professional chauffeur will arrive
- Real-time updates: You'll receive SMS updates on your chauffeur's location

NEED TO MAKE CHANGES?
Contact us at least 24 hours before your trip:
Phone: (214) 225-0105
Email: info@gonoblelane.com

Thank you for choosing Noble Lane Transportation!

---
Noble Lane Transportation
Dallas, TX | (214) 225-0105 | info@gonoblelane.com
Booking ID: ${data.bookingId} | Payment ID: ${data.paymentIntentId}
  `;
}

// Mock email service - replace with your actual email provider
export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<boolean> {
  try {
    // Use edge function for sending emails via Gmail
    const { callSupabaseEdgeFunction } = await import('./edge-functions');
    
    const result = await callSupabaseEdgeFunction('send-email', {
      to: data.customerEmail,
      subject: `Booking Confirmed - Noble Lane Transportation (${data.confirmationNumber})`,
      type: 'booking-confirmation',
      customerName: data.customerName || 'Valued Customer',
      bookingId: data.bookingId,
      pickupAddress: data.pickupAddress,
      destinationAddress: data.destinationAddress,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      passengers: data.passengers,
      vehicleName: data.vehicleName,
      totalAmount: data.totalAmount,
      confirmationNumber: data.confirmationNumber
    });

    return result.success;
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error);
    return false;
  }
}

export async function sendPaymentFailureEmail(data: PaymentFailureEmailData): Promise<boolean> {
  try {
    const { callSupabaseEdgeFunction } = await import('./edge-functions');
    
    const result = await callSupabaseEdgeFunction('send-email', {
      type: 'custom',
      customerEmail: data.customerEmail,
      customerName: 'Valued Customer',
      subject: 'Payment Failed - Noble Lane Transportation',
      customHtml: `
        <html>
        <head>
            <meta charset="utf-8">
            <title>Payment Failed - Noble Lane Transportation</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
                .error-details { background: #fee2e2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>❌ Payment Failed</h1>
                    <p>Noble Lane Transportation</p>
                </div>
                
                <div class="content">
                    <h2>Dear Valued Customer,</h2>
                    
                    <p>We were unable to process your payment for your Noble Lane Transportation booking.</p>
                    
                    <div class="error-details">
                        <h3>Payment Details:</h3>
                        <p><strong>Payment ID:</strong> ${data.paymentIntentId}</p>
                        <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
                        ${data.failureReason ? `<p><strong>Reason:</strong> ${data.failureReason}</p>` : ''}
                    </div>
                    
                    <h3>What to do next:</h3>
                    <ul>
                        <li>Please try booking again with a different payment method</li>
                        <li>Check with your bank if your card was declined</li>
                        <li>Contact us for immediate assistance: (214) 225-0105</li>
                    </ul>
                    
                    <p>We apologize for any inconvenience and look forward to serving you.</p>
                    
                    <p>Best regards,<br>
                    <strong>The Noble Lane Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>Noble Lane Executive Transport | Dallas-Fort Worth Area</p>
                    <p>📞 (214) 225-0105 | 📧 info@gonoblelane.com</p>
                </div>
            </div>
        </body>
        </html>
      `
    });

    return result.success;
  } catch (error) {
    console.error('❌ Failed to send payment failure email:', error);
    return false;
  }
}

export type { BookingEmailData, PaymentFailureEmailData };
