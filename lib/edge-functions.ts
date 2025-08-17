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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration missing');
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const response = await supabase.functions.invoke(functionName, {
      body: data
    });

    if (response.error) {
      console.error(`Edge Function ${functionName} error:`, response.error);
      throw response.error;
    }

    return {
      success: true,
      data: response.data
    };

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

// Specific function for processing quote requests
export async function processQuoteRequestViaEdge(quoteData: any): Promise<EdgeFunctionResponse> {
  return callSupabaseEdgeFunction('process-quote-request', quoteData);
}

// Specific function for sending SMS notifications
export async function sendSMSNotificationViaEdge(smsData: any): Promise<EdgeFunctionResponse> {
  return callSupabaseEdgeFunction('send-sms-notification', smsData);
}
