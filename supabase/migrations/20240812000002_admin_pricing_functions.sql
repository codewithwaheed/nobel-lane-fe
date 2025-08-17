-- Admin functions for pricing management
-- Migration: 20240812000002_admin_pricing_functions.sql

-- 1. Function to get all vehicle types with their pricing
CREATE OR REPLACE FUNCTION get_vehicle_pricing_summary()
RETURNS TABLE (
    vehicle_id TEXT,
    vehicle_name TEXT,
    capacity INTEGER,
    one_way_zones JSONB,
    hourly_rate DECIMAL,
    min_hours INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vt.vehicle_id,
        vt.name as vehicle_name,
        vt.capacity,
        -- Get one-way pricing for all zones as JSON
        COALESCE(
            (SELECT jsonb_object_agg(
                'zone_' || pg_oneway.zone::text, 
                pg_oneway.rate
            )
            FROM pricing_grid pg_oneway 
            WHERE pg_oneway.vehicle_id = vt.vehicle_id 
            AND pg_oneway.service_type = 'one-way'
            AND pg_oneway.is_active = true),
            '{}'::jsonb
        ) as one_way_zones,
        -- Get hourly rate
        pg_hourly.rate as hourly_rate,
        pg_hourly.min_hours
    FROM vehicle_types vt
    LEFT JOIN pricing_grid pg_hourly ON vt.vehicle_id = pg_hourly.vehicle_id 
        AND pg_hourly.service_type = 'hourly' 
        AND pg_hourly.is_active = true
    WHERE vt.is_active = true
    ORDER BY vt.capacity;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to update one-way pricing for a specific vehicle and zone
CREATE OR REPLACE FUNCTION update_oneway_pricing(
    p_vehicle_id TEXT,
    p_zone INTEGER,
    p_rate DECIMAL
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO pricing_grid (vehicle_id, service_type, zone, rate)
    VALUES (p_vehicle_id, 'one-way', p_zone, p_rate)
    ON CONFLICT (vehicle_id, service_type, zone)
    DO UPDATE SET 
        rate = EXCLUDED.rate,
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to update hourly pricing
CREATE OR REPLACE FUNCTION update_hourly_pricing(
    p_vehicle_id TEXT,
    p_rate DECIMAL,
    p_min_hours INTEGER DEFAULT 2
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO pricing_grid (vehicle_id, service_type, zone, rate, min_hours)
    VALUES (p_vehicle_id, 'hourly', NULL, p_rate, p_min_hours)
    ON CONFLICT (vehicle_id, service_type, zone)
    DO UPDATE SET 
        rate = EXCLUDED.rate,
        min_hours = EXCLUDED.min_hours,
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to update additional fees
CREATE OR REPLACE FUNCTION update_additional_fee(
    p_fee_type TEXT,
    p_amount DECIMAL,
    p_is_percentage BOOLEAN DEFAULT false
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE additional_fees 
    SET 
        amount = p_amount,
        is_percentage = p_is_percentage,
        updated_at = NOW()
    WHERE fee_type = p_fee_type;
    
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get pricing for a specific route
CREATE OR REPLACE FUNCTION get_route_pricing(
    p_pickup_zip TEXT,
    p_dropoff_zip TEXT DEFAULT NULL,
    p_service_type TEXT DEFAULT 'one-way',
    p_hours INTEGER DEFAULT NULL
) RETURNS TABLE (
    vehicle_id TEXT,
    vehicle_name TEXT,
    vehicle_description TEXT,
    capacity INTEGER,
    luggage_description TEXT,
    special_notes TEXT,
    base_rate DECIMAL,
    min_hours INTEGER,
    billable_hours INTEGER,
    total_cost DECIMAL,
    zone_used INTEGER
) AS $$
DECLARE
    pickup_zone INTEGER;
    dropoff_zone INTEGER;
    final_zone INTEGER;
BEGIN
    -- Get pickup zone
    SELECT zone INTO pickup_zone FROM zones WHERE zip_code = p_pickup_zip;
    
    IF p_service_type = 'one-way' THEN
        -- Get dropoff zone for one-way trips
        SELECT zone INTO dropoff_zone FROM zones WHERE zip_code = p_dropoff_zip;
        
        -- Use higher zone for pricing
        final_zone := GREATEST(COALESCE(pickup_zone, 0), COALESCE(dropoff_zone, 0));
        
        RETURN QUERY
        SELECT 
            vt.vehicle_id,
            vt.name,
            vt.description,
            vt.capacity,
            vt.luggage_description,
            vt.special_notes,
            pg.rate as base_rate,
            NULL::INTEGER as min_hours,
            NULL::INTEGER as billable_hours,
            pg.rate as total_cost,
            final_zone as zone_used
        FROM vehicle_types vt
        JOIN pricing_grid pg ON vt.vehicle_id = pg.vehicle_id
        WHERE pg.service_type = 'one-way' 
        AND pg.zone = final_zone
        AND vt.is_active = true 
        AND pg.is_active = true
        ORDER BY vt.capacity;
    ELSE
        -- Hourly rates
        RETURN QUERY
        SELECT 
            vt.vehicle_id,
            vt.name,
            vt.description,
            vt.capacity,
            vt.luggage_description,
            vt.special_notes,
            pg.rate as base_rate,
            pg.min_hours,
            GREATEST(COALESCE(p_hours, 0), COALESCE(pg.min_hours, 2)) as billable_hours,
            pg.rate * GREATEST(COALESCE(p_hours, 0), COALESCE(pg.min_hours, 2)) as total_cost,
            NULL::INTEGER as zone_used
        FROM vehicle_types vt
        JOIN pricing_grid pg ON vt.vehicle_id = pg.vehicle_id
        WHERE pg.service_type = 'hourly'
        AND vt.is_active = true 
        AND pg.is_active = true
        ORDER BY vt.capacity;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to bulk update pricing from JSON
CREATE OR REPLACE FUNCTION bulk_update_pricing(pricing_data JSONB)
RETURNS JSONB AS $$
DECLARE
    vehicle_key TEXT;
    vehicle_data JSONB;
    zone_key TEXT;
    zone_data JSONB;
    result JSONB := '{"success": true, "updated": 0, "errors": []}'::JSONB;
    update_count INTEGER := 0;
    error_msg TEXT;
BEGIN
    -- Update one-way pricing
    IF pricing_data ? 'airport_transfers' THEN
        FOR vehicle_key IN SELECT jsonb_object_keys(pricing_data->'airport_transfers'->'zones'->'zone_1')
        LOOP
            FOR zone_key IN SELECT jsonb_object_keys(pricing_data->'airport_transfers'->'zones')
            LOOP
                BEGIN
                    DECLARE
                        zone_num INTEGER := CAST(REPLACE(zone_key, 'zone_', '') AS INTEGER);
                        rate_val DECIMAL := CAST((pricing_data->'airport_transfers'->'zones'->zone_key->>vehicle_key) AS DECIMAL);
                    BEGIN
                        PERFORM update_oneway_pricing(vehicle_key, zone_num, rate_val);
                        update_count := update_count + 1;
                    END;
                EXCEPTION
                    WHEN OTHERS THEN
                        result := jsonb_set(
                            result, 
                            '{errors}', 
                            (result->'errors') || jsonb_build_array(
                                jsonb_build_object(
                                    'type', 'one-way',
                                    'vehicle', vehicle_key,
                                    'zone', zone_key,
                                    'error', SQLERRM
                                )
                            )
                        );
                END;
            END LOOP;
        END LOOP;
    END IF;
    
    -- Update hourly rates
    IF pricing_data ? 'hourly_rates' THEN
        FOR vehicle_key IN SELECT jsonb_object_keys(pricing_data->'hourly_rates'->'standard')
        LOOP
            BEGIN
                DECLARE
                    rate_val DECIMAL := CAST((pricing_data->'hourly_rates'->'standard'->vehicle_key->>'rate') AS DECIMAL);
                    min_hours_val INTEGER := CAST((pricing_data->'hourly_rates'->'standard'->vehicle_key->>'minimum_hours') AS INTEGER);
                BEGIN
                    PERFORM update_hourly_pricing(vehicle_key, rate_val, min_hours_val);
                    update_count := update_count + 1;
                END;
            EXCEPTION
                WHEN OTHERS THEN
                    result := jsonb_set(
                        result, 
                        '{errors}', 
                        (result->'errors') || jsonb_build_array(
                            jsonb_build_object(
                                'type', 'hourly',
                                'vehicle', vehicle_key,
                                'error', SQLERRM
                            )
                        )
                    );
            END;
        END LOOP;
    END IF;
    
    -- Update additional fees
    IF pricing_data ? 'additional_fees' THEN
        FOR vehicle_key IN SELECT jsonb_object_keys(pricing_data->'additional_fees')
        LOOP
            BEGIN
                DECLARE
                    fee_amount DECIMAL := CAST((pricing_data->'additional_fees'->>vehicle_key) AS DECIMAL);
                BEGIN
                    PERFORM update_additional_fee(vehicle_key, fee_amount, false);
                    update_count := update_count + 1;
                END;
            EXCEPTION
                WHEN OTHERS THEN
                    result := jsonb_set(
                        result, 
                        '{errors}', 
                        (result->'errors') || jsonb_build_array(
                            jsonb_build_object(
                                'type', 'additional_fee',
                                'fee_type', vehicle_key,
                                'error', SQLERRM
                            )
                        )
                    );
            END;
        END LOOP;
    END IF;
    
    result := jsonb_set(result, '{updated}', to_jsonb(update_count));
    RETURN result;
END;
$$ LANGUAGE plpgsql;
