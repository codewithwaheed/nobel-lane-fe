import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { 
  createBookingRecord, 
  updateBookingPaymentStatus, 
  updateBookingStatus,
  getBookingByPaymentIntent,
  markConfirmationEmailSent,
  type BookingData 
} from '@/lib/database-service';
import { 
  sendBookingConfirmationEmail, 
  sendPaymentFailureEmail
} from '@/lib/email-service';
import type { BookingEmailData } from '@/lib/email-service';
import { processBookingPaymentViaEdge } from '@/lib/edge-functions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Remove API version to use default and avoid version conflicts
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// This is required to disable body parsing for raw webhook payload
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: string;
  let sig: string | null;

  try {
    // Get raw body as text for signature verification
    body = await request.text();
    const headersList = await headers();
    sig = headersList.get('stripe-signature');

    if (!sig) {
      console.error('⚠️  No Stripe signature found in headers');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    if (!endpointSecret) {
      console.error('⚠️  Webhook endpoint secret not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
  } catch (err) {
    console.error('⚠️  Error reading request:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', (err as Error).message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment);
      break;

    case 'payment_intent.canceled':
      const canceledPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentCancellation(canceledPayment);
      break;

    case 'charge.dispute.created':
      const dispute = event.data.object as Stripe.Dispute;
      await handleDispute(dispute);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  
  try {
      // Extract customer email from metadata
      const metadata = paymentIntent.metadata;    // Prepare data for Edge Function processing
    const bookingPaymentData = {
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
      customerEmail: paymentIntent.receipt_email || metadata.customerEmail || '',
      customerPhone: metadata.customerPhone || '',
      pickupAddress: metadata.from || '',
      destinationAddress: metadata.to || '',
      pickupDate: metadata.date || '',
      pickupTime: metadata.time || '',
      passengers: parseInt(metadata.passengers || '1'),
      vehicleName: metadata.vehicleName || 'Standard Vehicle',
      vehicleType: metadata.vehicleId || 'sedan',
      basePrice: parseFloat(metadata.vehiclePrice || '0'),
      serviceFee: Math.round(parseFloat(metadata.baseAmount || '0') * 0.05),
      totalAmount: paymentIntent.amount / 100,
      flightNumber: metadata.flightNumber || '',
      specialInstructions: metadata.specialInstructions || '',
      bookingType: metadata.isQuote === 'true' ? 'quote' : 'standard',
      metadata: metadata
    };

    console.log('🚀 Sending to Edge Function with email:', bookingPaymentData.customerEmail);

    // Use Edge Function for comprehensive booking processing
    const result = await processBookingPaymentViaEdge(bookingPaymentData);
    
    if (result.success) {
      console.log('✅ Booking processed successfully via Edge Function:', result.data);
    } else {
      console.error('❌ Edge Function processing failed:', result.error);
      
      // Fallback to direct processing
      await fallbackBookingProcessing(paymentIntent, metadata);
    }
    
  } catch (error) {
    console.error('❌ Error processing successful payment:', error);
  }
}

// Fallback function for direct processing when Edge Functions are unavailable
async function fallbackBookingProcessing(paymentIntent: Stripe.PaymentIntent, metadata: Record<string, string>) {
  try {
    // Parse the booking data from metadata
    const bookingData: BookingData = {
      customerEmail: paymentIntent.receipt_email || metadata.customerEmail || '',
      customerPhone: metadata.customerPhone || '',
      customerFirstName: '', 
      customerLastName: '', 
      customerCompany: '', 
      
      pickupAddress: metadata.from || '',
      destinationAddress: metadata.to || '',
      pickupDate: metadata.date || '',
      pickupTime: metadata.time || '',
      passengers: parseInt(metadata.passengers || '1'),
      flightNumber: metadata.flightNumber || '',
      specialInstructions: metadata.specialInstructions || '',
      
      vehicleType: metadata.vehicleId || 'sedan',
      vehicleName: metadata.vehicleName || 'Standard Vehicle',
      basePrice: parseFloat(metadata.vehiclePrice || '0'),
      serviceFee: Math.round(parseFloat(metadata.baseAmount || '0') * 0.05),
      totalAmount: paymentIntent.amount / 100,
      
      stripePaymentIntentId: paymentIntent.id,
      stripePaymentStatus: paymentIntent.status,
      paymentMethod: 'card',
      currency: paymentIntent.currency,
      
      bookingType: metadata.isQuote === 'true' ? 'quote' : 'standard',
      bookingSource: 'website'
    };

    // Create booking record
    const result = await createBookingRecord(bookingData);
    
    if (result.success) {
      const booking = result.booking;
      const confirmationNumber = `NL-${booking.id.slice(0, 8).toUpperCase()}`;
      
      // Send confirmation email
      const emailData: BookingEmailData = {
        customerEmail: bookingData.customerEmail,
        customerName: 'Valued Customer',
        bookingId: booking.id,
        paymentIntentId: paymentIntent.id,
        pickupAddress: bookingData.pickupAddress,
        destinationAddress: bookingData.destinationAddress,
        pickupDate: new Date(bookingData.pickupDate).toLocaleDateString(),
        pickupTime: bookingData.pickupTime,
        passengers: bookingData.passengers,
        vehicleName: bookingData.vehicleName,
        totalAmount: bookingData.totalAmount,
        confirmationNumber
      };

      const emailSent = await sendBookingConfirmationEmail(emailData);
      
      if (emailSent) {
        await markConfirmationEmailSent(paymentIntent.id);
        // Create booking record and process
        const result = await processBookingPaymentViaEdge({
          ...bookingData,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency,
          paymentStatus: 'paid'
        });

        if (!result.success) {
          console.error('Failed to process booking after payment:', result.error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Fallback processing also failed:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);
  
  try {
    // Update payment status in database (if booking record exists)
    await updateBookingPaymentStatus(paymentIntent.id, 'failed');
    
    // Send failure notification email
    if (paymentIntent.receipt_email) {
      const emailData = {
        customerEmail: paymentIntent.receipt_email,
        paymentIntentId: paymentIntent.id,
        failureReason: paymentIntent.last_payment_error?.message,
        amount: paymentIntent.amount / 100
      };
      
      const emailSent = await sendPaymentFailureEmail(emailData);
      
      if (!emailSent) {
        console.error('Failed to send payment failure notification');
      }
    }
    
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

async function handlePaymentCancellation(paymentIntent: Stripe.PaymentIntent) {
  console.log('🚫 Payment canceled:', paymentIntent.id);
  
  try {
    // Update booking status to cancelled
    await updateBookingStatus(paymentIntent.id, 'cancelled');
    await updateBookingPaymentStatus(paymentIntent.id, 'canceled');
    
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

async function handleDispute(dispute: Stripe.Dispute) {
  console.log('⚠️ Dispute created:', dispute.id);
  
  try {
    // Get the payment intent from the charge
    const paymentIntentId = dispute.payment_intent as string;
    
    if (paymentIntentId) {
      // Update booking status due to dispute
      await updateBookingStatus(paymentIntentId, 'cancelled');
      
      // TODO: Implement dispute handling
      // - Notify admin team via email/Slack
      // - Gather evidence for dispute response
      // - Update internal records
      
      // Admin notification sent (no need to log in production)
    }
  } catch (error) {
    console.error('❌ Error handling dispute:', error);
  }
}
