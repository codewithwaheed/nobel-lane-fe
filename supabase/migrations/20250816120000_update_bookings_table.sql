-- Update bookings table to align with Stripe metadata and improve schema
-- This migration adds missing fields and optimizes the existing schema

-- Add new columns for location details
ALTER TABLE "public"."bookings" 
ADD COLUMN IF NOT EXISTS "pickup_zipcode" text,
ADD COLUMN IF NOT EXISTS "destination_zipcode" text,
ADD COLUMN IF NOT EXISTS "pickup_city" text,
ADD COLUMN IF NOT EXISTS "destination_city" text,
ADD COLUMN IF NOT EXISTS "pickup_state" text,
ADD COLUMN IF NOT EXISTS "destination_state" text,
ADD COLUMN IF NOT EXISTS "pickup_place_id" text,
ADD COLUMN IF NOT EXISTS "destination_place_id" text,
ADD COLUMN IF NOT EXISTS "pickup_latitude" decimal(10,8),
ADD COLUMN IF NOT EXISTS "pickup_longitude" decimal(11,8),
ADD COLUMN IF NOT EXISTS "destination_latitude" decimal(10,8),
ADD COLUMN IF NOT EXISTS "destination_longitude" decimal(11,8);

-- Add pricing breakdown columns
ALTER TABLE "public"."bookings"
ADD COLUMN IF NOT EXISTS "base_rate" decimal(10,2),
ADD COLUMN IF NOT EXISTS "tolls_amount" decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "extras_amount" decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "gratuity_amount" decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "subtotal_amount" decimal(10,2);

-- Add extra services breakdown
ALTER TABLE "public"."bookings"
ADD COLUMN IF NOT EXISTS "extra_stops_count" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "extra_stops_fee" decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "international_arrival_fee" decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "early_late_pickup_fee" decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "holiday_fee" decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "dfw_toll_fee" decimal(10,2) DEFAULT 0;

-- Add trip metadata
ALTER TABLE "public"."bookings"
ADD COLUMN IF NOT EXISTS "trip_type" text DEFAULT 'one-way' CHECK (trip_type IN ('one-way', 'by-the-hour')),
ADD COLUMN IF NOT EXISTS "trip_duration" text,
ADD COLUMN IF NOT EXISTS "is_quote" boolean DEFAULT false;

-- Add user profile fields for better customer management
ALTER TABLE "public"."bookings"
ADD COLUMN IF NOT EXISTS "customer_city" text,
ADD COLUMN IF NOT EXISTS "customer_state" text,
ADD COLUMN IF NOT EXISTS "customer_zipcode" text;

-- Add operational fields
ALTER TABLE "public"."bookings"
ADD COLUMN IF NOT EXISTS "driver_assigned" uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS "driver_notes" text,
ADD COLUMN IF NOT EXISTS "estimated_duration" interval,
ADD COLUMN IF NOT EXISTS "actual_pickup_time" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "actual_dropoff_time" timestamp with time zone;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS "idx_bookings_pickup_zipcode" ON "public"."bookings" ("pickup_zipcode");
CREATE INDEX IF NOT EXISTS "idx_bookings_destination_zipcode" ON "public"."bookings" ("destination_zipcode");
CREATE INDEX IF NOT EXISTS "idx_bookings_trip_type" ON "public"."bookings" ("trip_type");
CREATE INDEX IF NOT EXISTS "idx_bookings_is_quote" ON "public"."bookings" ("is_quote");
CREATE INDEX IF NOT EXISTS "idx_bookings_driver_assigned" ON "public"."bookings" ("driver_assigned");
CREATE INDEX IF NOT EXISTS "idx_bookings_pickup_city" ON "public"."bookings" ("pickup_city");

-- Update existing service_fee column to be more generic
COMMENT ON COLUMN "public"."bookings"."service_fee" IS 'Deprecated - use pricing breakdown columns instead';

-- Add helpful comments
COMMENT ON TABLE "public"."bookings" IS 'Main bookings table storing all reservation data with detailed pricing breakdown';
COMMENT ON COLUMN "public"."bookings"."stripe_payment_intent_id" IS 'Stripe PaymentIntent ID for payment tracking';
COMMENT ON COLUMN "public"."bookings"."base_rate" IS 'Base fare before extras and gratuity';
COMMENT ON COLUMN "public"."bookings"."total_amount" IS 'Final total including all fees and gratuity';
