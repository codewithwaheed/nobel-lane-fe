-- Add trip_type and duration fields to bookings table for consistency with quotes table

-- Add trip_type field only if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='trip_type') THEN
        ALTER TABLE bookings ADD COLUMN trip_type text NOT NULL DEFAULT 'one-way';
    END IF;
END $$;

-- Update or add the check constraint to allow only one-way and hourly
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_trip_type_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_trip_type_check CHECK (trip_type IN ('one-way', 'hourly'));

-- Add duration field only if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='duration') THEN
        ALTER TABLE bookings ADD COLUMN duration text;
    END IF;
END $$;

-- Create index for trip_type for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_trip_type ON bookings(trip_type);
