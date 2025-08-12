-- Create bookings table to store reservation data
CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    -- User information (link to auth.users)
    "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    "customer_email" text NOT NULL,
    "customer_phone" text,
    "customer_first_name" text,
    "customer_last_name" text,
    "customer_company" text,
    
    -- Trip details
    "pickup_address" text NOT NULL,
    "destination_address" text,
    "pickup_date" date NOT NULL,
    "pickup_time" time NOT NULL,
    "passengers" integer NOT NULL DEFAULT 1,
    "flight_number" text,
    "special_instructions" text,
    
    -- Vehicle and pricing
    "vehicle_type" text NOT NULL,
    "vehicle_name" text NOT NULL,
    "base_price" decimal(10,2) NOT NULL,
    "service_fee" decimal(10,2) NOT NULL DEFAULT 0,
    "total_amount" decimal(10,2) NOT NULL,
    
    -- Payment information
    "stripe_payment_intent_id" text UNIQUE NOT NULL,
    "stripe_payment_status" text NOT NULL DEFAULT 'pending',
    "payment_method" text DEFAULT 'card',
    "currency" text DEFAULT 'usd',
    
    -- Booking status
    "booking_status" text NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    "booking_type" text NOT NULL DEFAULT 'standard' CHECK (booking_type IN ('standard', 'quote')),
    
    -- Metadata
    "booking_source" text DEFAULT 'website',
    "admin_notes" text,
    "confirmation_sent_at" timestamp with time zone,
    "reminder_sent_at" timestamp with time zone
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_bookings_user_id" ON "public"."bookings" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_stripe_payment_intent" ON "public"."bookings" ("stripe_payment_intent_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_pickup_date" ON "public"."bookings" ("pickup_date");
CREATE INDEX IF NOT EXISTS "idx_bookings_status" ON "public"."bookings" ("booking_status");
CREATE INDEX IF NOT EXISTS "idx_bookings_customer_email" ON "public"."bookings" ("customer_email");

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON "public"."bookings" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON "public"."bookings"
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own bookings
CREATE POLICY "Users can create own bookings" ON "public"."bookings"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for webhooks and admin)
CREATE POLICY "Service role can manage all bookings" ON "public"."bookings"
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";
