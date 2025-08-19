import {
  BookingEmailData,
  buildPricingTable,
  escapeHtml,
  formatCurrency,
} from "./email-service.ts";

/** ---------------------------
 * Booking HTML
 * -------------------------- */
export function generateBookingConfirmationHTML(
  data: BookingEmailData,
): string {
  const baseUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") ||
    "https://gonoblelane.com";
  const logoUrl = `${baseUrl}/logo.png`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - Noble Lane Transportation</title>
  <style>
    /* Client-safe baseline */
    body{margin:0;padding:20px;background:#f9fafb;color:#1f2937;-webkit-text-size-adjust:none;}
    .container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);}
    .header{background:linear-gradient(135deg,#f59e0b 0%,#ea580c 100%);color:#fff;padding:36px 28px;text-align:center;}
    .logo{height:60px;width:auto;filter:brightness(0) invert(1);margin-bottom:10px;}
    h1{margin:8px 0 0 0;font-size:24px;line-height:1.25;}
    .content{padding:32px 24px;}
    .greeting{font-size:17px;font-weight:700;margin-bottom:12px;}
    .intro{color:#4b5563;line-height:1.6;margin-bottom:18px;font-size:15px;}
    .card{background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:18px 0;}
    .card.soft{background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);border-color:#e2e8f0;}
    .section-title{font-size:16px;font-weight:800;margin:0 0 8px 0;color:#1f2937;}
    .row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid #e5e7eb;}
    .row:last-child{border-bottom:none;}
    .kv{color:#374151;font-weight:600;}
    .val{text-align:right;max-width:60%;word-wrap:break-word;}
    .tag{background:#fef3c7;color:#92400e;padding:6px 10px;border-radius:8px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-weight:700;letter-spacing:.5px;white-space:nowrap;}
    .steps{background:#eff6ff;border:1px solid #dbeafe;border-radius:12px;padding:18px;margin:18px 0;}
    .steps h3{margin:0 0 8px 0;color:#1e40af;font-size:16px;}
    .steps ul{padding:0;margin:0;list-style:none;}
    .steps li{padding:6px 0 6px 22px;position:relative;font-size:14px;}
    .steps li:before{content:'✓';position:absolute;left:0;top:6px;color:#10b981;font-weight:700;}
    .footer{background:#1f2937;color:#d1d5db;padding:24px;text-align:center;font-size:13px;line-height:1.6;}
    .footer a{color:#f59e0b;text-decoration:none;}
    .muted{color:#9ca3af;font-size:12px;margin-top:10px;}
    @media (max-width:600px){
      body{padding:10px;}
      .content{padding:24px 16px;}
      .row{flex-direction:column;gap:6px;}
      .val{text-align:left;max-width:100%;}
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Noble Lane Transportation Logo" class="logo">
      <h1>🎉 Booking Confirmed!</h1>
      <div style="opacity:.95;font-size:14px;">Thank you for choosing Noble Lane Transportation</div>
    </div>

    <div class="content">
      <div class="greeting">Hello ${escapeHtml(data.customerName)},</div>
      <div class="intro">We're excited to confirm your luxury transportation booking. Your reservation has been successfully processed and is now confirmed in our system.</div>

      <div class="card soft">
        <div class="section-title">📋 Booking Details</div>

        <div class="row">
          <div class="kv">Confirmation Number</div>
          <div class="val"><span class="tag">${
    escapeHtml(data.confirmationNumber)
  }</span></div>
        </div>

        <div class="row">
          <div class="kv">Pickup Location</div>
          <div class="val">${escapeHtml(data.pickupAddress)}</div>
        </div>

        ${
    data.destinationAddress
      ? `
        <div class="row">
          <div class="kv">Destination</div>
          <div class="val">${escapeHtml(data.destinationAddress)}</div>
        </div>`
      : ""
  }

        <div class="row">
          <div class="kv">Date &amp; Time</div>
          <div class="val">${escapeHtml(data.pickupDate)} at ${
    escapeHtml(data.pickupTime)
  }</div>
        </div>

        <div class="row">
          <div class="kv">Passengers</div>
          <div class="val">${data.passengers} passenger${
    data.passengers === 1 ? "" : "s"
  }</div>
        </div>

        <div class="row">
          <div class="kv">Vehicle</div>
          <div class="val">${escapeHtml(data.vehicleName)}</div>
        </div>
      </div>

      ${
    data.pricingBreakdown
      ? `<div class="card soft">
             <div class="section-title">💰 Pricing Breakdown</div>
             ${buildPricingTable(data.pricingBreakdown, "amber")}
           </div>`
      : `<div class="card soft">
             <div class="section-title">💰 Total Amount</div>
             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
               <tr>
                 <td style="padding:8px 0; font-weight:700; color:#92400e;">Total (including gratuity & fees)</td>
                 <td align="right" style="padding:8px 0; font-weight:800; color:#f59e0b; white-space:nowrap;">${
        formatCurrency(data.totalAmount)
      }</td>
               </tr>
             </table>
           </div>`
  }

      <div class="steps">
        <h3>🚗 What Happens Next?</h3>
        <ul>
          <li><strong>24–48 hours before:</strong> We'll confirm pickup details and share your chauffeur's info.</li>
          <li><strong>15 minutes early:</strong> Your uniformed chauffeur arrives at the specified location.</li>
          <li><strong>Real-time updates:</strong> You'll receive SMS with vehicle and driver details.</li>
          <li><strong>24/7 support:</strong> Our team is available for any questions or changes.</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <div><strong>Noble Lane Transportation</strong><br/>Premium Luxury Transportation Services</div>
      <div style="margin-top:10px;">
        📞 <a href="tel:+12142250105">Call us anytime</a> &nbsp;|&nbsp;
        📧 <a href="mailto:office@gonoblelane.com">office@gonoblelane.com</a> &nbsp;|&nbsp;
        🌐 <a href="https://gonoblelane.com">gonoblelane.com</a>
      </div>
      <div class="muted">
        This is an automated message. Please do not reply. If you need assistance, contact our support team.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/** ---------------------------
 * Booking TEXT
 * -------------------------- */
export function generateBookingConfirmationText(
  data: BookingEmailData,
): string {
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

${
    data.pricingBreakdown
      ? `
PRICING BREAKDOWN:
==================
Base Rate:         ${formatCurrency(data.pricingBreakdown.baseRate)}${
        data.pricingBreakdown.additionalFees &&
          data.pricingBreakdown.additionalFees.length > 0
          ? `

ADDITIONAL FEES:
${
            data.pricingBreakdown.additionalFees
              .map(
                (fee) =>
                  `${fee.name}: ${formatCurrency(fee.amount)}${
                    fee.description ? `\n   (${fee.description})` : ""
                  }`,
              )
              .join("\n")
          }`
          : ""
      }
Gratuity${
        data.pricingBreakdown.gratuityPercentage
          ? ` (${data.pricingBreakdown.gratuityPercentage}%)`
          : ""
      }:      ${formatCurrency(data.pricingBreakdown.gratuity)}
==========================================
TOTAL AMOUNT:      ${formatCurrency(data.pricingBreakdown.totalAmount)}
`
      : `
TOTAL AMOUNT: ${formatCurrency(data.totalAmount)}
`
  }

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
