-- Add early_pickup_requested column to track when customer explicitly requests early pickup
-- This is separate from the early_late_pickup_fee which is calculated based on time

ALTER TABLE "public"."bookings" 
ADD COLUMN IF NOT EXISTS "early_pickup_requested" boolean DEFAULT false;

-- Add index for this field if needed for queries
CREATE INDEX IF NOT EXISTS "idx_bookings_early_pickup_requested" ON "public"."bookings" ("early_pickup_requested");
