import { NextRequest, NextResponse } from 'next/server';
import { processQuoteRequestViaEdge } from '@/lib/edge-functions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerEmail && !body.customerPhone) {
      return NextResponse.json(
        { error: 'Either email or phone number is required' },
        { status: 400 }
      );
    }

    if (!body.pickupAddress || !body.pickupDate || !body.pickupTime) {
      return NextResponse.json(
        { error: 'Trip details (pickup address, date, time) are required' },
        { status: 400 }
      );
    }

    if (!body.vehicleType || !body.vehicleName) {
      return NextResponse.json(
        { error: 'Vehicle selection is required' },
        { status: 400 }
      );
    }

    // Process quote request via edge function
    const result = await processQuoteRequestViaEdge(body);
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      console.error('Edge function error:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to process quote request' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing quote request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
