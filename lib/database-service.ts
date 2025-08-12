// Database service for booking operations
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface BookingData {
  // User information
  userId?: string;
  customerEmail: string;
  customerPhone?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerCompany?: string;

  // Trip details
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  flightNumber?: string;
  specialInstructions?: string;

  // Vehicle and pricing
  vehicleType: string;
  vehicleName: string;
  basePrice: number;
  serviceFee: number;
  totalAmount: number;

  // Payment information
  stripePaymentIntentId: string;
  stripePaymentStatus: string;
  paymentMethod?: string;
  currency?: string;

  // Booking metadata
  bookingType?: 'standard' | 'quote';
  bookingSource?: string;
}

export interface CreateBookingResult {
  success: boolean;
  booking?: any;
  error?: string;
}

export async function createBookingRecord(data: BookingData): Promise<CreateBookingResult> {
  try {
    const bookingRecord = {
      // User information
      user_id: data.userId || null,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone || null,
      customer_first_name: data.customerFirstName || null,
      customer_last_name: data.customerLastName || null,
      customer_company: data.customerCompany || null,

      // Trip details
      pickup_address: data.pickupAddress,
      destination_address: data.destinationAddress || null,
      pickup_date: data.pickupDate,
      pickup_time: data.pickupTime,
      passengers: data.passengers,
      flight_number: data.flightNumber || null,
      special_instructions: data.specialInstructions || null,

      // Vehicle and pricing
      vehicle_type: data.vehicleType,
      vehicle_name: data.vehicleName,
      base_price: data.basePrice,
      service_fee: data.serviceFee,
      total_amount: data.totalAmount,

      // Payment information
      stripe_payment_intent_id: data.stripePaymentIntentId,
      stripe_payment_status: data.stripePaymentStatus,
      payment_method: data.paymentMethod || 'card',
      currency: data.currency || 'usd',

      // Booking status
      booking_status: 'confirmed',
      booking_type: data.bookingType || 'standard',
      booking_source: data.bookingSource || 'website',
    };

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert(bookingRecord)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating booking:', error);
      return { success: false, error: error.message };
    }

    return { success: true, booking };

  } catch (error) {
    console.error('❌ Error creating booking record:', error);
    return { success: false, error: 'Failed to create booking record' };
  }
}

export async function updateBookingPaymentStatus(
  paymentIntentId: string, 
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📝 Updating payment status for ${paymentIntentId} to ${status}`);

    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ 
        stripe_payment_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (error) {
      console.error('❌ Database error updating payment status:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Payment status updated successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    return { success: false, error: 'Failed to update payment status' };
  }
}

export async function updateBookingStatus(
  paymentIntentId: string, 
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📝 Updating booking status for ${paymentIntentId} to ${status}`);

    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ 
        booking_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (error) {
      console.error('❌ Database error updating booking status:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Booking status updated successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    return { success: false, error: 'Failed to update booking status' };
  }
}

export async function getBookingByPaymentIntent(paymentIntentId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (error) {
      console.error('❌ Error fetching booking:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching booking by payment intent:', error);
    return null;
  }
}

export async function markConfirmationEmailSent(paymentIntentId: string): Promise<void> {
  try {
    await supabaseAdmin
      .from('bookings')
      .update({ 
        confirmation_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntentId);
  } catch (error) {
    console.error('❌ Error marking confirmation email as sent:', error);
  }
}
