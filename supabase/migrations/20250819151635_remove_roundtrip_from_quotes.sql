-- Remove round-trip support from quotes table to simplify trip types

-- Drop the existing check constraint
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_trip_type_check;

-- Add new constraint without round-trip (only one-way and hourly)
ALTER TABLE quotes ADD CONSTRAINT quotes_trip_type_check CHECK (trip_type IN ('one-way', 'hourly'));

-- Remove round-trip related columns that are no longer needed
ALTER TABLE quotes DROP COLUMN IF EXISTS return_date;
ALTER TABLE quotes DROP COLUMN IF EXISTS return_time;
