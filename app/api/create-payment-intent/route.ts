import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', bookingData } = await request.json();

    // Create comprehensive metadata from booking data
    const metadata: Record<string, string> = {
      // Trip details
      tripType: bookingData.type || 'one-way',
      from: bookingData.from || '',
      to: bookingData.to || '',
      duration: bookingData.duration || '',
      date: bookingData.date || '',
      time: bookingData.time || '',
      passengers: bookingData.passengers?.toString() || '1',
      
      // Customer information
      customerPhone: bookingData.phone || '',
      customerEmail: bookingData.email || '',
      
      // Vehicle information
      vehicleId: bookingData.selectedVehicle?.id?.toString() || '',
      vehicleName: bookingData.selectedVehicle?.name || '',
      vehiclePrice: bookingData.selectedVehicle?.price?.toString() || '',
      vehiclePassengers: bookingData.selectedVehicle?.passengers?.toString() || '',
      vehicleBags: bookingData.selectedVehicle?.bags?.toString() || '',
      
      // Additional trip information
      flightNumber: bookingData.flightNumber || '',
      specialInstructions: bookingData.notes || '',
      
      // Place details (if using Google Places)
      fromPlaceId: bookingData.fromPlaceId || '',
      toPlaceId: bookingData.toPlaceId || '',
      fromLat: bookingData.fromLat?.toString() || '',
      fromLng: bookingData.fromLng?.toString() || '',
      toLat: bookingData.toLat?.toString() || '',
      toLng: bookingData.toLng?.toString() || '',
      
      // Booking metadata
      isQuote: bookingData.isQuote?.toString() || 'false',
      currentStep: bookingData.currentStep?.toString() || '',
      completedSteps: JSON.stringify(bookingData.completedSteps || []),
      submittedAt: bookingData.submittedAt || new Date().toISOString(),
      
      // Pricing breakdown
      baseAmount: amount.toString(),
      serviceFeeRate: '0.05', // 5%
      currency: currency,
    };

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amounts in cents
      currency,
      receipt_email: bookingData.email || undefined, // Set receipt email if available
      metadata,
      // Only allow card payments
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
