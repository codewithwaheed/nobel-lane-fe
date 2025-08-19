-- Add quote_number column to quotes table for direct querying
ALTER TABLE quotes ADD COLUMN quote_number TEXT UNIQUE;

-- Create index for faster lookups on quote_number
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

-- Add booking_number column to bookings table for direct querying
ALTER TABLE bookings ADD COLUMN booking_number TEXT UNIQUE;

-- Create index for faster lookups on booking_number
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);
