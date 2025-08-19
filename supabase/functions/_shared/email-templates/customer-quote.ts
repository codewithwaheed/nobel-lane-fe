import {
  buildPricingTable,
  escapeHtml,
  formatCurrency,
  QuoteEmailData,
} from "./email-service.ts";

/** ---------------------------
 * Quote HTML
 * -------------------------- */
export function generateQuoteConfirmationHTML(data: QuoteEmailData): string {
  const baseUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") ||
    "https://gonoblelane.com";
  const logoUrl = `${baseUrl}/logo.png`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Request Received - Noble Lane Transportation</title>
  <style>
    body{margin:0;padding:20px;background:#f9fafb;color:#1f2937;-webkit-text-size-adjust:none;}
    .container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);}
    .header{background:linear-gradient(135deg,#3b82f6 0%,#1e40af 100%);color:#fff;padding:36px 28px;text-align:center;}
    .logo{height:60px;width:auto;filter:brightness(0) invert(1);margin-bottom:10px;}
    h1{margin:8px 0 0 0;font-size:24px;line-height:1.25;}
    .content{padding:32px 24px;}
    .greeting{font-size:17px;font-weight:700;margin-bottom:12px;}
    .intro{color:#4b5563;line-height:1.6;margin-bottom:18px;font-size:15px;}
    .card{background:#ffffff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:18px 0;}
    .card.soft{background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);}
    .section-title{font-size:16px;font-weight:800;margin:0 0 8px 0;color:#1e40af;}
    .row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid #e5e7eb;}
    .row:last-child{border-bottom:none;}
    .kv{color:#374151;font-weight:600;}
    .val{text-align:right;max-width:60%;word-wrap:break-word;}
    .tag{background:#dbeafe;color:#1e40af;padding:6px 10px;border-radius:8px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-weight:700;letter-spacing:.5px;white-space:nowrap;}
    .steps{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px;margin:18px 0;}
    .steps h3{margin:0 0 8px 0;color:#166534;font-size:16px;}
    .steps ul{padding:0;margin:0;list-style:none;}
    .steps li{padding:6px 0 6px 22px;position:relative;font-size:14px;}
    .steps li:before{content:'✓';position:absolute;left:0;top:6px;color:#10b981;font-weight:700;}
    .note{background:#fffbeb;border:1px solid #fed7aa;border-radius:12px;padding:16px;text-align:center;margin:16px 0;color:#92400e;}
    .footer{background:#1f2937;color:#d1d5db;padding:24px;text-align:center;font-size:13px;line-height:1.6;}
    .footer a{color:#3b82f6;text-decoration:none;}
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
      <h1>📋 Quote Request Received!</h1>
      <div style="opacity:.95;font-size:14px;">We're preparing your custom transportation quote</div>
    </div>

    <div class="content">
      <div class="greeting">Hello ${escapeHtml(data.customerName)},</div>
      <div class="intro">Thank you for your interest in Noble Lane Transportation! We have received your request and we're preparing a personalized quote for your needs.</div>

      <div class="card soft">
        <div class="section-title">📋 Quote Request Details</div>

        <div class="row">
          <div class="kv">Quote Number</div>
          <div class="val"><span class="tag">${
    escapeHtml(data.quoteNumber)
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
          <div class="kv">Vehicle Type</div>
          <div class="val">${escapeHtml(data.vehicleName)}</div>
        </div>
      </div>

      ${
    data.pricingBreakdown
      ? `<div class="card soft">
             <div class="section-title">💰 Estimated Pricing</div>
             ${buildPricingTable(data.pricingBreakdown, "blue")}
           </div>`
      : ""
  }

      <div class="steps">
        <h3>⏱️ What Happens Next?</h3>
        <ul>
          <li><strong>Within 2 hours:</strong> We’ll review your request and prepare a detailed quote.</li>
          <li><strong>Personal consultation:</strong> We may contact you for preferences or clarifications.</li>
          <li><strong>Custom pricing:</strong> You'll receive a transparent, itemized quote via email.</li>
          <li><strong>Easy booking:</strong> Book directly through our secure system if you're satisfied.</li>
        </ul>
      </div>

      <div class="card" style="background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);border:none;text-align:center;color:#fff;">
        <div style="font-weight:800;font-size:18px;margin-bottom:8px;">Ready to Book?</div>
        <div style="opacity:0.95;margin-bottom:16px;font-size:14px;">Skip the wait and book directly with your quote details pre-filled</div>
        <a href="${baseUrl}/book-now?quoteId=${escapeHtml(data.quoteNumber)}" 
           style="display:inline-block;background:#fff;color:#f59e0b;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          📅 Book This Quote Now
        </a>
      </div>

      <div class="note">
        <div style="font-weight:700;margin-bottom:4px;">Questions or Special Requests?</div>
        <div style="font-size:13px;">Our customer service team is available 24/7 to assist you.</div>
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
        This is an automated message. Please do not reply. If you need assistance, please contact our quotes team.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/** ---------------------------
 * Quote TEXT
 * -------------------------- */
export function generateQuoteConfirmationText(data: QuoteEmailData): string {
  const baseUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") ||
    "https://gonoblelane.com";

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

${
    data.pricingBreakdown
      ? `
ESTIMATED PRICING:
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
ESTIMATED TOTAL:   ${formatCurrency(data.pricingBreakdown.totalAmount)}
`
      : ""
  }

WHAT HAPPENS NEXT:
==================
✓ Within 2 hours: Our team will review your request and prepare a detailed quote
✓ Personal consultation: We may contact you to discuss specific requirements or preferences
✓ Custom pricing: You'll receive a personalized quote via email with transparent pricing
✓ Easy booking: If you're satisfied with the quote, you can book directly through our secure system

READY TO BOOK NOW?
==================
Skip the wait and book directly with your quote details already filled in:
🔗 ${baseUrl}/book-now?quoteId=${data.quoteNumber}

Click the link above or copy and paste it into your browser to start booking immediately.

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
