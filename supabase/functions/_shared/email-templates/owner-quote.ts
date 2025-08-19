// Owner quote notification email templates

export interface OwnerQuoteData {
  customerEmail: string;
  customerPhone: string;
  customerFirstName?: string;
  customerLastName?: string;
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleName: string;
  baseRate: number;
  totalPrice: number;
  quoteNumber: string;
  tripType: string;
  duration?: string;
  flightNumber?: string;
  specialRequests?: string;
  pickupZipcode?: string;
  dropoffZipcode?: string;
  submittedAt: string;
}

export function generateOwnerQuoteHTML(data: OwnerQuoteData): string {
  // DEBUG: Log the data received by the template
  console.log("🔍 DEBUGGING: Owner quote template received data:", {
    vehicleName: data.vehicleName,
    baseRate: data.baseRate,
    totalPrice: data.totalPrice,
    baseRateType: typeof data.baseRate,
    totalPriceType: typeof data.totalPrice,
    baseRateGreaterThanZero:
      (data.baseRate && typeof data.baseRate === "number" && data.baseRate > 0),
    totalPriceGreaterThanZero:
      (data.totalPrice && typeof data.totalPrice === "number" &&
        data.totalPrice > 0),
  });

  const customerName = data.customerFirstName || data.customerLastName
    ? `${data.customerFirstName || ""} ${data.customerLastName || ""}`.trim()
    : "Not Provided";

  const tripDetails = data.tripType === "hourly"
    ? `${data.duration} hours of service starting from ${data.pickupLocation}`
    : `From: ${data.pickupLocation}${
      data.dropoffLocation ? `\nTo: ${data.dropoffLocation}` : ""
    }`;

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚨 New Quote Request - Immediate Action Required</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .quote-number { font-size: 24px; font-weight: bold; margin: 10px 0; }
        .urgent { background: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .trip-details { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0; }
        .customer-info { background: #f0f9ff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
        .price-highlight { font-size: 24px; color: #059669; font-weight: bold; background: #f0fdf4; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .action-items { background: #fffbeb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .alert-icon { font-size: 48px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f8fafc; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <div class="alert-icon">🚨</div>
        <h1>New Quote Request</h1>
        <div class="quote-number">Quote #${data.quoteNumber}</div>
        <p style="margin: 10px 0; font-size: 18px;">⚡ IMMEDIATE ACTION REQUIRED ⚡</p>
    </div>
    
    <div class="content">
        <div class="urgent">
            <h3>🎯 ACTION ITEMS:</h3>
            <ul>
                <li><strong>Review quote details below</strong></li>
                <li><strong>Check vehicle availability for ${data.pickupDate} at ${data.pickupTime}</strong></li>
                <li><strong>Contact customer within 30 minutes if needed</strong></li>
                <li><strong>Monitor for booking conversion</strong></li>
            </ul>
        </div>
        
        <div class="customer-info">
            <h3>👤 Customer Information</h3>
            <table>
                <tr><th>Name:</th><td>${customerName}</td></tr>
                <tr><th>Email:</th><td><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></td></tr>
                <tr><th>Phone:</th><td><a href="tel:${data.customerPhone}">${data.customerPhone}</a></td></tr>
                <tr><th>Quote Submitted:</th><td>${
    new Date(data.submittedAt).toLocaleString()
  }</td></tr>
            </table>
        </div>
        
        <div class="trip-details">
            <h3>🚗 Trip Details</h3>
            <table>
                <tr><th>Service Type:</th><td>${
    data.tripType === "hourly" ? "By-the-Hour Service" : "One-Way Transfer"
  }</td></tr>
                <tr><th>Date & Time:</th><td><strong>${data.pickupDate} at ${data.pickupTime}</strong></td></tr>
                <tr><th>Trip Details:</th><td>${
    tripDetails.replace(/\n/g, "<br>")
  }</td></tr>
                <tr><th>Passengers:</th><td>${data.passengers}</td></tr>
                <tr><th>Vehicle Requested:</th><td><strong>${data.vehicleName}</strong></td></tr>
                ${
    data.flightNumber
      ? `<tr><th>Flight Number:</th><td>${data.flightNumber}</td></tr>`
      : ""
  }
                ${
    data.specialRequests
      ? `<tr><th>Special Requests:</th><td>${data.specialRequests}</td></tr>`
      : ""
  }
                ${
    data.pickupZipcode
      ? `<tr><th>Pickup Zone:</th><td>${data.pickupZipcode}</td></tr>`
      : ""
  }
                ${
    data.dropoffZipcode
      ? `<tr><th>Dropoff Zone:</th><td>${data.dropoffZipcode}</td></tr>`
      : ""
  }
            </table>
        </div>
        
        <div class="price-highlight">
            💰 Estimated Amount: ${
    (data.totalPrice && typeof data.totalPrice === "number" &&
        data.totalPrice > 0)
      ? `$${data.totalPrice.toFixed(2)}`
      : "Pricing Required - Please Calculate Quote"
  }
            <br><small style="font-size: 14px; color: #6b7280;">(Base Rate: ${
    (data.baseRate && typeof data.baseRate === "number" && data.baseRate > 0)
      ? `$${data.baseRate.toFixed(2)}`
      : "TBD"
  })</small>
        </div>
        
        <div class="action-items">
            <h4>📋 Next Steps:</h4>
            <ol>
                <li><strong>Vehicle Assignment:</strong> Check availability and assign driver</li>
                <li><strong>Customer Follow-up:</strong> Call if special requirements need clarification</li>
                <li><strong>Booking Monitor:</strong> Customer has booking link - watch for conversion</li>
                <li><strong>Schedule Management:</strong> Add to dispatch system if they book</li>
            </ol>
            
            <p><strong>Customer Booking Link:</strong><br>
            <a href="${
    Deno.env.get("FRONTEND_URL") || "http://localhost:3000"
  }/book-now?quoteId=${data.quoteNumber}" target="_blank">
                ${
    Deno.env.get("FRONTEND_URL") || "http://localhost:3000"
  }/book-now?quoteId=${data.quoteNumber}
            </a></p>
        </div>
        
    </div>
    
    <div class="footer">
        <p><strong>Noble Lane Transportation</strong> - Owner Dashboard<br>
        Quote Reference: #${data.quoteNumber} | Generated: ${
    new Date().toLocaleString()
  }</p>
    </div>
</body>
</html>`;
}

export function generateOwnerQuoteText(data: OwnerQuoteData): string {
  console.log(
    `🔍 Debug - generateOwnerQuoteText data:`,
    JSON.stringify(data, null, 2),
  );

  const customerName = data.customerFirstName || data.customerLastName
    ? `${data.customerFirstName || ""} ${data.customerLastName || ""}`.trim()
    : "Not Provided";

  const tripDetails = data.tripType === "hourly"
    ? `${data.duration} hours of service starting from ${data.pickupLocation}`
    : `From: ${data.pickupLocation}${
      data.dropoffLocation ? `\nTo: ${data.dropoffLocation}` : ""
    }`;

  return `🚨 NEW QUOTE REQUEST - IMMEDIATE ACTION REQUIRED

Quote #${data.quoteNumber}
Submitted: ${new Date(data.submittedAt).toLocaleString()}

ACTION ITEMS:
• Review quote details below
• Check vehicle availability for ${data.pickupDate} at ${data.pickupTime}
• Contact customer within 30 minutes if needed
• Monitor for booking conversion

CUSTOMER INFORMATION:
Name: ${customerName}
Email: ${data.customerEmail}
Phone: ${data.customerPhone}

TRIP DETAILS:
Service Type: ${
    data.tripType === "hourly" ? "By-the-Hour Service" : "One-Way Transfer"
  }
Date & Time: ${data.pickupDate} at ${data.pickupTime}
Trip Details: ${tripDetails}
Passengers: ${data.passengers}
Vehicle Requested: ${data.vehicleName}
${data.flightNumber ? `Flight Number: ${data.flightNumber}` : ""}
${data.specialRequests ? `Special Requests: ${data.specialRequests}` : ""}
${data.pickupZipcode ? `Pickup Zone: ${data.pickupZipcode}` : ""}
${data.dropoffZipcode ? `Dropoff Zone: ${data.dropoffZipcode}` : ""}

ESTIMATED AMOUNT: ${
    (data.totalPrice && typeof data.totalPrice === "number" &&
        data.totalPrice > 0)
      ? `$${data.totalPrice.toFixed(2)}`
      : "Pricing Required - Please Calculate Quote"
  }
Base Rate: ${
    (data.baseRate && typeof data.baseRate === "number" && data.baseRate > 0)
      ? `$${data.baseRate.toFixed(2)}`
      : "TBD"
  }
(Base Rate: $${
    (data.baseRate && typeof data.baseRate === "number")
      ? data.baseRate.toFixed(2)
      : "TBD"
  })

NEXT STEPS:
1. Vehicle Assignment: Check availability and assign driver
2. Customer Follow-up: Call if special requirements need clarification
3. Booking Monitor: Customer has booking link - watch for conversion
4. Schedule Management: Add to dispatch system if they book

Customer Booking Link:
${
    Deno.env.get("FRONTEND_URL") || "http://localhost:3000"
  }/book-now?quoteId=${data.quoteNumber}

⏰ Time-sensitive: Customer expecting prompt service. Quote valid for 7 days.

---
Noble Lane Transportation - Owner Dashboard
Quote Reference: #${data.quoteNumber} | Generated: ${
    new Date().toLocaleString()
  }`;
}
