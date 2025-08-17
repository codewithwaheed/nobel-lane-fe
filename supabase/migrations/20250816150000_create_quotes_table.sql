-- Create quotes table for handling both booking-quote and get-quote flows
CREATE TABLE public.quotes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Quote source tracking
    quote_type text NOT NULL DEFAULT 'quote' CHECK (quote_type IN ('booking-quote', 'get-quote')),
    quote_source text NOT NULL DEFAULT 'website', -- website, mobile-app, api
    
    -- Customer information
    customer_email text NOT NULL,
    customer_phone text,
    customer_first_name text,
    customer_last_name text,
    customer_company text,
    
    -- Trip details
    trip_type text NOT NULL DEFAULT 'one-way' CHECK (trip_type IN ('one-way', 'round-trip', 'hourly')),
    pickup_address text NOT NULL,
    destination_address text,
    pickup_date date NOT NULL,
    pickup_time time NOT NULL,
    return_date date,
    return_time time,
    trip_duration text, -- for hourly bookings
    passengers integer NOT NULL DEFAULT 1,
    
    -- Location details (for mapping and optimization)
    pickup_zipcode text,
    destination_zipcode text,
    pickup_city text,
    destination_city text,
    pickup_state text,
    destination_state text,
    pickup_place_id text, -- Google Places ID
    destination_place_id text, -- Google Places ID
    pickup_latitude decimal,
    pickup_longitude decimal,
    destination_latitude decimal,
    destination_longitude decimal,
    
    -- Vehicle and service details
    vehicle_type text NOT NULL DEFAULT 'sedan',
    vehicle_name text NOT NULL DEFAULT 'Standard Vehicle',
    flight_number text,
    special_instructions text,
    
    -- Pricing information
    base_rate decimal(10,2) NOT NULL DEFAULT 0,
    tolls_amount decimal(10,2) NOT NULL DEFAULT 0,
    extras_amount decimal(10,2) NOT NULL DEFAULT 0,
    gratuity_amount decimal(10,2) NOT NULL DEFAULT 0,
    subtotal_amount decimal(10,2) NOT NULL DEFAULT 0,
    total_amount decimal(10,2) NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'usd',
    
    -- Extra services breakdown
    extra_stops_count integer NOT NULL DEFAULT 0,
    extra_stops_fee decimal(10,2) NOT NULL DEFAULT 0,
    international_arrival_fee decimal(10,2) NOT NULL DEFAULT 0,
    early_late_pickup_fee decimal(10,2) NOT NULL DEFAULT 0,
    holiday_fee decimal(10,2) NOT NULL DEFAULT 0,
    dfw_toll_fee decimal(10,2) NOT NULL DEFAULT 0,
    
    -- Quote status and workflow
    quote_status text NOT NULL DEFAULT 'pending' CHECK (quote_status IN ('pending', 'sent', 'accepted', 'declined', 'expired', 'converted')),
    expires_at timestamptz DEFAULT (now() + interval '7 days'), -- Quotes expire after 7 days
    
    -- Payment information (if converted to booking)
    stripe_payment_intent_id text UNIQUE,
    converted_booking_id uuid REFERENCES public.bookings(id),
    converted_at timestamptz,
    
    -- Admin tracking
    admin_notes text,
    quote_sent_at timestamptz,
    follow_up_sent_at timestamptz,
    
    -- Metadata for recommendations and context
    recommendations jsonb DEFAULT '[]'::jsonb,
    form_data jsonb DEFAULT '{}'::jsonb -- Store original form data
);

-- Add indexes for performance
CREATE INDEX idx_quotes_customer_email ON public.quotes(customer_email);
CREATE INDEX idx_quotes_pickup_date ON public.quotes(pickup_date);
CREATE INDEX idx_quotes_quote_status ON public.quotes(quote_status);
CREATE INDEX idx_quotes_quote_type ON public.quotes(quote_type);
CREATE INDEX idx_quotes_created_at ON public.quotes(created_at);
CREATE INDEX idx_quotes_stripe_payment_intent_id ON public.quotes(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public insert for quote submissions
CREATE POLICY "Allow public quote creation" ON public.quotes FOR INSERT WITH CHECK (true);

-- Allow public select for quote verification (limited fields)
CREATE POLICY "Allow public quote read" ON public.quotes FOR SELECT USING (true);

-- Allow admin full access (you can customize this based on your admin role system)
CREATE POLICY "Allow admin full access" ON public.quotes FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.quotes IS 'Stores quote requests from both booking-quote and get-quote flows';
COMMENT ON COLUMN public.quotes.quote_type IS 'booking-quote: from booking flow, get-quote: from dedicated quote flow';
COMMENT ON COLUMN public.quotes.quote_status IS 'Workflow status of the quote request';
COMMENT ON COLUMN public.quotes.expires_at IS 'When the quote expires (default 7 days)';
