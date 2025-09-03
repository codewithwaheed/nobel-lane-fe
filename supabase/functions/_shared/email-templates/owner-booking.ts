// Owner booking notification email templates

export interface OwnerBookingData {
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
  totalAmount: number;
  confirmationNumber: string;
  tripType: string;
  duration?: string;
  flightNumber?: string;
  specialRequests?: string;
  earlyPickupRequested?: boolean;
  paymentMethod?: string;
  pickupZipcode?: string;
  dropoffZipcode?: string;
  paymentIntentId: string;
  bookingSubmittedAt: string;
}

export function generateOwnerBookingHTML(data: OwnerBookingData): string {
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
    <title>💰 New Booking Confirmed - Action Required</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .confirmation-number { font-size: 24px; font-weight: bold; margin: 10px 0; }
        .urgent { background: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #059669; }
        .trip-details { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0; }
        .customer-info { background: #f0f9ff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
        .payment-info { background: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .amount-highlight { font-size: 28px; color: #059669; font-weight: bold; background: #f0fdf4; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .action-items { background: #fffbeb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .success-icon { font-size: 48px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f8fafc; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <div class="success-icon">💰</div>
        <h1>New Booking Confirmed!</h1>
        <div class="confirmation-number">Confirmation #${data.confirmationNumber}</div>
        <p style="margin: 10px 0; font-size: 18px;">🎉 PAYMENT RECEIVED - DISPATCH NEEDED 🎉</p>
    </div>
    
    <div class="content">
        <div class="urgent">
            <h3>⚡ IMMEDIATE DISPATCH ACTIONS:</h3>
            <ul>
                <li><strong>Assign driver for ${data.pickupDate} at ${data.pickupTime}</strong></li>
                <li><strong>Add to dispatch system and schedule</strong></li>
                <li><strong>Send driver details to customer 24hrs before</strong></li>
                <li><strong>Set up flight monitoring if airport pickup</strong></li>
                <li><strong>Payment confirmed - funds will be deposited</strong></li>
            </ul>
        </div>
        
        <div class="amount-highlight">
            💳 Payment Received: $${
    (data.totalAmount && typeof data.totalAmount === "number")
      ? data.totalAmount.toFixed(2)
      : "TBD"
  }
            <br><small style="font-size: 16px; color: #6b7280;">Payment Method: ${
    data.paymentMethod || "Credit Card"
  }</small>
        </div>
        
        <div class="customer-info">
            <h3>👤 Customer Information</h3>
            <table>
                <tr><th>Name:</th><td>${customerName}</td></tr>
                <tr><th>Email:</th><td><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></td></tr>
                <tr><th>Phone:</th><td><a href="tel:${data.customerPhone}">${data.customerPhone}</a></td></tr>
                <tr><th>Booking Time:</th><td>${
    new Date(data.bookingSubmittedAt).toLocaleString()
  }</td></tr>
            </table>
        </div>
        
        <div class="trip-details">
            <h3>🚗 Confirmed Trip Details</h3>
            <table>
                <tr><th>Service Type:</th><td><strong>${
    data.tripType === "hourly" ? "By-the-Hour Service" : "One-Way Transfer"
  }</strong></td></tr>
                <tr><th>Date & Time:</th><td><strong style="color: #dc2626;">${data.pickupDate} at ${data.pickupTime}</strong></td></tr>
                <tr><th>Trip Details:</th><td>${
    tripDetails.replace(/\n/g, "<br>")
  }</td></tr>
                <tr><th>Passengers:</th><td>${data.passengers}</td></tr>
                <tr><th>Vehicle Assigned:</th><td><strong>${data.vehicleName}</strong></td></tr>
                ${
    data.flightNumber
      ? `<tr><th>Flight Number:</th><td><strong>${data.flightNumber}</strong> (Set up monitoring)</td></tr>`
      : ""
  }
                ${
    data.earlyPickupRequested
      ? `<tr><th>Early Pickup:</th><td style="background: #fef3c7; padding: 8px; border-radius: 4px;"><strong>⏰ EARLY PICKUP REQUESTED</strong> - Customer specifically requested early pickup service</td></tr>`
      : ""
  }
                ${
    data.specialRequests
      ? `<tr><th>Special Requests:</th><td style="background: #fef3c7; padding: 8px; border-radius: 4px;"><strong>${data.specialRequests}</strong></td></tr>`
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
        
        <div class="payment-info">
            <h4>💳 Payment Information</h4>
            <table>
                <tr><th>Payment Status:</th><td><strong style="color: #059669;">✅ CONFIRMED</strong></td></tr>
                <tr><th>Amount:</th><td><strong>$${
    (data.totalAmount && typeof data.totalAmount === "number")
      ? data.totalAmount.toFixed(2)
      : "TBD"
  }</strong></td></tr>
                <tr><th>Payment Method:</th><td>${
    data.paymentMethod || "Credit Card"
  }</td></tr>
                <tr><th>Transaction ID:</th><td>${data.paymentIntentId}</td></tr>
                <tr><th>Confirmation:</th><td><strong>#${data.confirmationNumber}</strong></td></tr>
            </table>
        </div>

        
        <p style="color: #059669; font-weight: bold; font-size: 18px;">
            🎯 BOOKING CONFIRMED - Customer paid and expecting service!
        </p>
    </div>
    
    <div class="footer">
        <p><strong>Noble Lane Transportation</strong> - Owner Dashboard<br>
        Confirmation: #${data.confirmationNumber} | Transaction: ${data.paymentIntentId}<br>
        Generated: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
}

export function generateOwnerBookingText(data: OwnerBookingData): string {
  const customerName = data.customerFirstName || data.customerLastName
    ? `${data.customerFirstName || ""} ${data.customerLastName || ""}`.trim()
    : "Not Provided";

  const tripDetails = data.tripType === "hourly"
    ? `${data.duration} hours of service starting from ${data.pickupLocation}`
    : `From: ${data.pickupLocation}${
      data.dropoffLocation ? `\nTo: ${data.dropoffLocation}` : ""
    }`;

  return `💰 NEW BOOKING CONFIRMED - DISPATCH NEEDED

Confirmation #${data.confirmationNumber}
Payment Received: $${
    (data.totalAmount && typeof data.totalAmount === "number")
      ? data.totalAmount.toFixed(2)
      : "TBD"
  }
Booking Time: ${new Date(data.bookingSubmittedAt).toLocaleString()}

IMMEDIATE DISPATCH ACTIONS:
• Assign driver for ${data.pickupDate} at ${data.pickupTime}
• Add to dispatch system and schedule
• Send driver details to customer 24hrs before
• Set up flight monitoring if airport pickup
• Payment confirmed - funds will be deposited

CUSTOMER INFORMATION:
Name: ${customerName}
Email: ${data.customerEmail}
Phone: ${data.customerPhone}

CONFIRMED TRIP DETAILS:
Service Type: ${
    data.tripType === "hourly" ? "By-the-Hour Service" : "One-Way Transfer"
  }
Date & Time: ${data.pickupDate} at ${data.pickupTime}
Trip Details: ${tripDetails}
Passengers: ${data.passengers}
Vehicle Assigned: ${data.vehicleName}
${
    data.flightNumber
      ? `Flight Number: ${data.flightNumber} (Set up monitoring)`
      : ""
  }
${
    data.earlyPickupRequested
      ? `⏰ EARLY PICKUP REQUESTED - Customer specifically requested early pickup service`
      : ""
  }
${data.specialRequests ? `Special Requests: ${data.specialRequests}` : ""}
${data.pickupZipcode ? `Pickup Zone: ${data.pickupZipcode}` : ""}
${data.dropoffZipcode ? `Dropoff Zone: ${data.dropoffZipcode}` : ""}

PAYMENT INFORMATION:
Payment Status: ✅ CONFIRMED
Amount: $${
    (data.totalAmount && typeof data.totalAmount === "number")
      ? data.totalAmount.toFixed(2)
      : "TBD"
  }
Payment Method: ${data.paymentMethod || "Credit Card"}
Transaction ID: ${data.paymentIntentId}
Confirmation: #${data.confirmationNumber}

CRITICAL NEXT STEPS:
1. Driver Assignment: Assign qualified driver immediately
2. Dispatch System: Enter into scheduling system
3. Customer Communication: Send driver details 24 hours before pickup
4. Vehicle Preparation: Ensure ${data.vehicleName} is ready and clean
5. Route Planning: Plan optimal route and check traffic
${
    data.flightNumber
      ? "6. Flight Monitoring: Set up automated flight tracking"
      : ""
  }
${
    data.specialRequests
      ? "7. Special Accommodations: Prepare for special requests noted above"
      : ""
  }

🎯 BOOKING CONFIRMED - Customer paid and expecting service!

---
Noble Lane Transportation - Owner Dashboard
Confirmation: #${data.confirmationNumber} | Transaction: ${data.paymentIntentId}
Generated: ${new Date().toLocaleString()}`;
}
