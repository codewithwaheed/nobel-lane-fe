#!/bin/bash

# Test script for the enhanced send-booking-confirmation function
# Tests both booking and quote email flows

echo "🧪 Testing Enhanced Email Function (Booking + Quote + Future SMS)"
echo "================================================================"

# Test 1: Booking Confirmation
echo ""
echo "📧 Test 1: Booking Confirmation Email"
echo "-------------------------------------"

curl -i --location --request POST 'http://localhost:54321/functions/v1/send-booking-confirmation' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "booking",
    "bookingId": "test-booking-123",
    "customerEmail": "customer@example.com",
    "customerName": "John Doe",
    "pickupAddress": "Dallas Fort Worth International Airport (DFW), 2400 Aviation Dr, DFW Airport, TX 75261, USA",
    "destinationAddress": "Downtown Dallas, 1500 Main St, Dallas, TX 75201, USA",
    "pickupDate": "August 20, 2025",
    "pickupTime": "2:00 PM",
    "passengers": 2,
    "vehicleName": "Luxury Sedan",
    "totalAmount": 150.00,
    "confirmationNumber": "NL-TEST123",
    "sendSMS": false
  }'

echo ""
echo ""

# Test 2: Quote Request Confirmation  
echo "📋 Test 2: Quote Request Confirmation Email"
echo "-------------------------------------------"

curl -i --location --request POST 'http://localhost:54321/functions/v1/send-booking-confirmation' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "quote",
    "quoteId": "test-quote-456",
    "customerEmail": "quote@example.com",
    "customerName": "Jane Smith",
    "pickupAddress": "Los Angeles International Airport (LAX), 1 World Way, Los Angeles, CA 90045, USA",
    "destinationAddress": "Beverly Hills, CA 90210, USA",
    "pickupDate": "September 15, 2025",
    "pickupTime": "10:30 AM",
    "passengers": 4,
    "vehicleName": "Luxury SUV",
    "quoteNumber": "QT-TEST456",
    "sendSMS": true,
    "phoneNumber": "+1234567890"
  }'

echo ""
echo ""
echo "🎉 Test completed!"
echo "📧 Check your email for both booking confirmation and quote request emails"
echo "📱 SMS integration is prepared for future Twilio implementation"
