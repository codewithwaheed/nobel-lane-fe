-- Improved pricing system with comprehensive vehicle types and pricing structure
-- Migration: 20240812000001_improve_pricing_system.sql

-- 1. Vehicle Types Table
CREATE TABLE IF NOT EXISTS vehicle_types (
    id SERIAL PRIMARY KEY,
    vehicle_id TEXT UNIQUE NOT NULL, -- e.g., 'standard_sedan', 'executive_sedan'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    luggage_description TEXT NOT NULL,
    special_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert vehicle types
INSERT INTO vehicle_types (vehicle_id, name, description, capacity, luggage_description, special_notes) VALUES
('standard_sedan', 'Standard Sedan', 'Standard luxury sedan for 1-3 passengers', 3, 'Standard trunk space', NULL),
('executive_sedan', 'Executive Sedan', 'Executive sedan for 1-4 passengers', 4, 'Large trunk space', NULL),
('luxury_sedan', 'Luxury Sedan', 'Premium luxury sedan for 1-4 passengers', 4, 'Large trunk space', NULL),
('executive_suv', 'Executive SUV', 'Premium luxury SUV for 1-6 passengers', 6, 'Large cargo area', NULL),
('luxury_suv', 'Luxury SUV', 'Spacious luxury SUV for 1-6 passengers', 6, 'Large cargo area', NULL),
('sprinter', 'Sprinter Van', 'Luxury Mercedes Sprinter van with 3-hour minimum', 13, 'Large luggage compartment', 'Always has 3-hour minimum regardless of day'),
('coach', 'Coach Bus', 'Large coach bus with 5-hour minimum', 55, 'Large luggage compartment', 'Always has 5-hour minimum regardless of day');

CREATE TABLE IF NOT EXISTS zones (
    zip_code TEXT PRIMARY KEY,
    city TEXT,
    dfw_zone INTEGER NOT NULL,
    dal_zone INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_zones_dfw_zone ON zones(dfw_zone);
CREATE INDEX IF NOT EXISTS idx_zones_dal_zone ON zones(dal_zone);

-- 3. Improved Pricing Grid Table
DROP TABLE IF EXISTS pricing_grid CASCADE;

CREATE TABLE pricing_grid (
    id SERIAL PRIMARY KEY,
    vehicle_id TEXT NOT NULL REFERENCES vehicle_types(vehicle_id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (service_type IN ('one-way', 'hourly')),
    zone INTEGER, -- NULL for hourly rates since they're zone-independent
    rate DECIMAL(10,2) NOT NULL,
    min_hours INTEGER DEFAULT NULL, -- Only for hourly rates
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique combinations
    UNIQUE(vehicle_id, service_type, zone)
);

-- Create indexes for performance
CREATE INDEX idx_pricing_grid_vehicle_service ON pricing_grid(vehicle_id, service_type);
CREATE INDEX idx_pricing_grid_zone ON pricing_grid(zone);

-- 4. Additional Fees Table
CREATE TABLE IF NOT EXISTS additional_fees (
    id SERIAL PRIMARY KEY,
    fee_type TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    is_percentage BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert additional fees
INSERT INTO additional_fees (fee_type, name, description, amount, is_percentage) VALUES
('early_late', 'Early/Late Pickup', 'Additional fee for pickups before 6 AM or after 10 PM', 20.00, false),
('extra_stop', 'Extra Stop', 'Fee per additional stop during journey', 10.00, false),
('international_arrival', 'International Arrival', 'Additional fee for international flight arrivals', 25.00, false),
('flight_tracking', 'Flight Tracking', 'Flight monitoring and delay adjustments', 5.00, false),
('dfw_toll', 'DFW Airport Toll', 'DFW Airport toll charges', 4.43, false),
('gratuity', 'Gratuity', 'Standard gratuity for chauffeur service', 20.00, true),
('tolls', 'Estimated Tolls', 'Estimated toll charges for route', 5.00, true);

-- 5. Insert Airport Transfer Pricing (One-way)
INSERT INTO pricing_grid (vehicle_id, service_type, zone, rate) VALUES
-- Zone 1
('executive_sedan', 'one-way', 1, 110.00),
('luxury_sedan', 'one-way', 1, 285.00),
('executive_suv', 'one-way', 1, 130.00),
('luxury_suv', 'one-way', 1, 285.00),

-- Zone 2
('executive_sedan', 'one-way', 2, 125.00),
('luxury_sedan', 'one-way', 2, 285.00),
('executive_suv', 'one-way', 2, 149.00),
('luxury_suv', 'one-way', 2, 285.00),

-- Zone 3
('executive_sedan', 'one-way', 3, 125.00),
('luxury_sedan', 'one-way', 3, 285.00),
('executive_suv', 'one-way', 3, 149.00),
('luxury_suv', 'one-way', 3, 285.00),

-- Zone 4
('executive_sedan', 'one-way', 4, 140.00),
('luxury_sedan', 'one-way', 4, 285.00),
('executive_suv', 'one-way', 4, 165.00),
('luxury_suv', 'one-way', 4, 285.00),

-- Zone 5
('executive_sedan', 'one-way', 5, 160.00),
('luxury_sedan', 'one-way', 5, 315.00),
('executive_suv', 'one-way', 5, 180.00),
('luxury_suv', 'one-way', 5, 315.00);

-- 6. Insert Hourly Rates
INSERT INTO pricing_grid (vehicle_id, service_type, zone, rate, min_hours) VALUES
('standard_sedan', 'hourly', NULL, 95.00, 2),
('executive_sedan', 'hourly', NULL, 110.00, 2),
('luxury_sedan', 'hourly', NULL, 150.00, 2),
('executive_suv', 'hourly', NULL, 110.00, 2),
('luxury_suv', 'hourly', NULL, 150.00, 2),
('sprinter', 'hourly', NULL, 150.00, 3),
('coach', 'hourly', NULL, 200.00, 5);

-- 7. Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for updated_at
CREATE TRIGGER update_vehicle_types_updated_at BEFORE UPDATE ON vehicle_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_grid_updated_at BEFORE UPDATE ON pricing_grid FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_additional_fees_updated_at BEFORE UPDATE ON additional_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Create views for easier querying
CREATE OR REPLACE VIEW pricing_with_vehicle_details AS
SELECT 
    pg.id,
    pg.vehicle_id,
    vt.name as vehicle_name,
    vt.description as vehicle_description,
    vt.capacity,
    vt.luggage_description,
    vt.special_notes,
    pg.service_type,
    pg.zone,
    pg.rate,
    pg.min_hours,
    pg.is_active,
    pg.created_at,
    pg.updated_at
FROM pricing_grid pg
JOIN vehicle_types vt ON pg.vehicle_id = vt.vehicle_id
WHERE pg.is_active = true AND vt.is_active = true;

-- 10. Grant permissions (adjust as needed for your setup)
-- These might need to be adjusted based on your Supabase setup
-- GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_types TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON pricing_grid TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON additional_fees TO authenticated;
-- GRANT SELECT ON pricing_with_vehicle_details TO authenticated;

-- 11. Create RLS policies (Row Level Security) - uncomment and adjust as needed
-- ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pricing_grid ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE additional_fees ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your auth requirements)
-- CREATE POLICY "Anyone can read vehicle types" ON vehicle_types FOR SELECT USING (true);
-- CREATE POLICY "Anyone can read pricing" ON pricing_grid FOR SELECT USING (true);
-- CREATE POLICY "Anyone can read additional fees" ON additional_fees FOR SELECT USING (true);
