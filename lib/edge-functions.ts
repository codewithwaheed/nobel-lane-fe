// Utility to call Supabase Edge Functions from webhooks
interface EdgeFunctionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function callSupabaseEdgeFunction(
  functionName: string, 
  data: any
): Promise<EdgeFunctionResponse> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge Function call failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return { success: true, data: result };

  } catch (error) {
    console.error(`Error calling Edge Function ${functionName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Specific function for processing booking payments
export async function processBookingPaymentViaEdge(bookingData: any): Promise<EdgeFunctionResponse> {
  return callSupabaseEdgeFunction('process-booking-payment', bookingData);
}

// Specific function for sending booking confirmations
export async function sendBookingConfirmationViaEdge(emailData: any): Promise<EdgeFunctionResponse> {
  return callSupabaseEdgeFunction('send-booking-confirmation', emailData);
}
