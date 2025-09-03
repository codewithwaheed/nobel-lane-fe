

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "auth";


ALTER SCHEMA "auth" OWNER TO "supabase_admin";


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "storage";


ALTER SCHEMA "storage" OWNER TO "supabase_admin";


CREATE TYPE "auth"."aal_level" AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE "auth"."aal_level" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."code_challenge_method" AS ENUM (
    's256',
    'plain'
);


ALTER TYPE "auth"."code_challenge_method" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."factor_status" AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE "auth"."factor_status" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."factor_type" AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE "auth"."factor_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."oauth_registration_type" AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE "auth"."oauth_registration_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."one_time_token_type" AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE "auth"."one_time_token_type" OWNER TO "supabase_auth_admin";


CREATE OR REPLACE FUNCTION "auth"."email"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION "auth"."email"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."email"() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';



CREATE OR REPLACE FUNCTION "auth"."jwt"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION "auth"."jwt"() OWNER TO "supabase_auth_admin";


CREATE OR REPLACE FUNCTION "auth"."role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION "auth"."role"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."role"() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';



CREATE OR REPLACE FUNCTION "auth"."uid"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION "auth"."uid"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."uid"() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';



CREATE OR REPLACE FUNCTION "public"."bulk_update_pricing"("pricing_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."bulk_update_pricing"("pricing_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_route_pricing"("p_pickup_zip" "text", "p_dropoff_zip" "text" DEFAULT NULL::"text", "p_service_type" "text" DEFAULT 'one-way'::"text", "p_hours" integer DEFAULT NULL::integer) RETURNS TABLE("vehicle_id" "text", "vehicle_name" "text", "vehicle_description" "text", "capacity" integer, "luggage_description" "text", "special_notes" "text", "base_rate" numeric, "min_hours" integer, "billable_hours" integer, "total_cost" numeric, "zone_used" integer)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_route_pricing"("p_pickup_zip" "text", "p_dropoff_zip" "text", "p_service_type" "text", "p_hours" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vehicle_pricing_summary"() RETURNS TABLE("vehicle_id" "text", "vehicle_name" "text", "capacity" integer, "one_way_zones" "jsonb", "hourly_rate" numeric, "min_hours" integer)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_vehicle_pricing_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_additional_fee"("p_fee_type" "text", "p_amount" numeric, "p_is_percentage" boolean DEFAULT false) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_additional_fee"("p_fee_type" "text", "p_amount" numeric, "p_is_percentage" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_hourly_pricing"("p_vehicle_id" "text", "p_rate" numeric, "p_min_hours" integer DEFAULT 2) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_hourly_pricing"("p_vehicle_id" "text", "p_rate" numeric, "p_min_hours" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_oneway_pricing"("p_vehicle_id" "text", "p_zone" integer, "p_rate" numeric) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_oneway_pricing"("p_vehicle_id" "text", "p_zone" integer, "p_rate" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "storage"."can_insert_object"("bucketid" "text", "name" "text", "owner" "uuid", "metadata" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION "storage"."can_insert_object"("bucketid" "text", "name" "text", "owner" "uuid", "metadata" "jsonb") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."extension"("name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION "storage"."extension"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."filename"("name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION "storage"."filename"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."foldername"("name" "text") RETURNS "text"[]
    LANGUAGE "plpgsql"
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION "storage"."foldername"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."get_size_by_bucket"() RETURNS TABLE("size" bigint, "bucket_id" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION "storage"."get_size_by_bucket"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."list_multipart_uploads_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer DEFAULT 100, "next_key_token" "text" DEFAULT ''::"text", "next_upload_token" "text" DEFAULT ''::"text") RETURNS TABLE("key" "text", "id" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION "storage"."list_multipart_uploads_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer, "next_key_token" "text", "next_upload_token" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."list_objects_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer DEFAULT 100, "start_after" "text" DEFAULT ''::"text", "next_token" "text" DEFAULT ''::"text") RETURNS TABLE("name" "text", "id" "uuid", "metadata" "jsonb", "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION "storage"."list_objects_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer, "start_after" "text", "next_token" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."operation"() RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION "storage"."operation"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."search"("prefix" "text", "bucketname" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "offsets" integer DEFAULT 0, "search" "text" DEFAULT ''::"text", "sortcolumn" "text" DEFAULT 'name'::"text", "sortorder" "text" DEFAULT 'asc'::"text") RETURNS TABLE("name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION "storage"."search"("prefix" "text", "bucketname" "text", "limits" integer, "levels" integer, "offsets" integer, "search" "text", "sortcolumn" "text", "sortorder" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION "storage"."update_updated_at_column"() OWNER TO "supabase_storage_admin";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "auth"."audit_log_entries" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "payload" json,
    "created_at" timestamp with time zone,
    "ip_address" character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE "auth"."audit_log_entries" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."audit_log_entries" IS 'Auth: Audit trail for user actions.';



CREATE TABLE IF NOT EXISTS "auth"."flow_state" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid",
    "auth_code" "text" NOT NULL,
    "code_challenge_method" "auth"."code_challenge_method" NOT NULL,
    "code_challenge" "text" NOT NULL,
    "provider_type" "text" NOT NULL,
    "provider_access_token" "text",
    "provider_refresh_token" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "authentication_method" "text" NOT NULL,
    "auth_code_issued_at" timestamp with time zone
);


ALTER TABLE "auth"."flow_state" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."flow_state" IS 'stores metadata for pkce logins';



CREATE TABLE IF NOT EXISTS "auth"."identities" (
    "provider_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "identity_data" "jsonb" NOT NULL,
    "provider" "text" NOT NULL,
    "last_sign_in_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "email" "text" GENERATED ALWAYS AS ("lower"(("identity_data" ->> 'email'::"text"))) STORED,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "auth"."identities" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."identities" IS 'Auth: Stores identities associated to a user.';



COMMENT ON COLUMN "auth"."identities"."email" IS 'Auth: Email is a generated column that references the optional email property in the identity_data';



CREATE TABLE IF NOT EXISTS "auth"."instances" (
    "id" "uuid" NOT NULL,
    "uuid" "uuid",
    "raw_base_config" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "auth"."instances" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."instances" IS 'Auth: Manages users across multiple sites.';



CREATE TABLE IF NOT EXISTS "auth"."mfa_amr_claims" (
    "session_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "authentication_method" "text" NOT NULL,
    "id" "uuid" NOT NULL
);


ALTER TABLE "auth"."mfa_amr_claims" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_amr_claims" IS 'auth: stores authenticator method reference claims for multi factor authentication';



CREATE TABLE IF NOT EXISTS "auth"."mfa_challenges" (
    "id" "uuid" NOT NULL,
    "factor_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "verified_at" timestamp with time zone,
    "ip_address" "inet" NOT NULL,
    "otp_code" "text",
    "web_authn_session_data" "jsonb"
);


ALTER TABLE "auth"."mfa_challenges" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_challenges" IS 'auth: stores metadata about challenge requests made';



CREATE TABLE IF NOT EXISTS "auth"."mfa_factors" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "friendly_name" "text",
    "factor_type" "auth"."factor_type" NOT NULL,
    "status" "auth"."factor_status" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "secret" "text",
    "phone" "text",
    "last_challenged_at" timestamp with time zone,
    "web_authn_credential" "jsonb",
    "web_authn_aaguid" "uuid"
);


ALTER TABLE "auth"."mfa_factors" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_factors" IS 'auth: stores metadata about factors';



CREATE TABLE IF NOT EXISTS "auth"."oauth_clients" (
    "id" "uuid" NOT NULL,
    "client_id" "text" NOT NULL,
    "client_secret_hash" "text" NOT NULL,
    "registration_type" "auth"."oauth_registration_type" NOT NULL,
    "redirect_uris" "text" NOT NULL,
    "grant_types" "text" NOT NULL,
    "client_name" "text",
    "client_uri" "text",
    "logo_uri" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "oauth_clients_client_name_length" CHECK (("char_length"("client_name") <= 1024)),
    CONSTRAINT "oauth_clients_client_uri_length" CHECK (("char_length"("client_uri") <= 2048)),
    CONSTRAINT "oauth_clients_logo_uri_length" CHECK (("char_length"("logo_uri") <= 2048))
);


ALTER TABLE "auth"."oauth_clients" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."one_time_tokens" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token_type" "auth"."one_time_token_type" NOT NULL,
    "token_hash" "text" NOT NULL,
    "relates_to" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "one_time_tokens_token_hash_check" CHECK (("char_length"("token_hash") > 0))
);


ALTER TABLE "auth"."one_time_tokens" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."refresh_tokens" (
    "instance_id" "uuid",
    "id" bigint NOT NULL,
    "token" character varying(255),
    "user_id" character varying(255),
    "revoked" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "parent" character varying(255),
    "session_id" "uuid"
);


ALTER TABLE "auth"."refresh_tokens" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."refresh_tokens" IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';



CREATE SEQUENCE IF NOT EXISTS "auth"."refresh_tokens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "auth"."refresh_tokens_id_seq" OWNER TO "supabase_auth_admin";


ALTER SEQUENCE "auth"."refresh_tokens_id_seq" OWNED BY "auth"."refresh_tokens"."id";



CREATE TABLE IF NOT EXISTS "auth"."saml_providers" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "entity_id" "text" NOT NULL,
    "metadata_xml" "text" NOT NULL,
    "metadata_url" "text",
    "attribute_mapping" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "name_id_format" "text",
    CONSTRAINT "entity_id not empty" CHECK (("char_length"("entity_id") > 0)),
    CONSTRAINT "metadata_url not empty" CHECK ((("metadata_url" = NULL::"text") OR ("char_length"("metadata_url") > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK (("char_length"("metadata_xml") > 0))
);


ALTER TABLE "auth"."saml_providers" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."saml_providers" IS 'Auth: Manages SAML Identity Provider connections.';



CREATE TABLE IF NOT EXISTS "auth"."saml_relay_states" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "request_id" "text" NOT NULL,
    "for_email" "text",
    "redirect_to" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "flow_state_id" "uuid",
    CONSTRAINT "request_id not empty" CHECK (("char_length"("request_id") > 0))
);


ALTER TABLE "auth"."saml_relay_states" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."saml_relay_states" IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';



CREATE TABLE IF NOT EXISTS "auth"."schema_migrations" (
    "version" character varying(255) NOT NULL
);


ALTER TABLE "auth"."schema_migrations" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."schema_migrations" IS 'Auth: Manages updates to the auth system.';



CREATE TABLE IF NOT EXISTS "auth"."sessions" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "factor_id" "uuid",
    "aal" "auth"."aal_level",
    "not_after" timestamp with time zone,
    "refreshed_at" timestamp without time zone,
    "user_agent" "text",
    "ip" "inet",
    "tag" "text"
);


ALTER TABLE "auth"."sessions" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sessions" IS 'Auth: Stores session data associated to a user.';



COMMENT ON COLUMN "auth"."sessions"."not_after" IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';



CREATE TABLE IF NOT EXISTS "auth"."sso_domains" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "domain" "text" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK (("char_length"("domain") > 0))
);


ALTER TABLE "auth"."sso_domains" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sso_domains" IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';



CREATE TABLE IF NOT EXISTS "auth"."sso_providers" (
    "id" "uuid" NOT NULL,
    "resource_id" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "disabled" boolean,
    CONSTRAINT "resource_id not empty" CHECK ((("resource_id" = NULL::"text") OR ("char_length"("resource_id") > 0)))
);


ALTER TABLE "auth"."sso_providers" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sso_providers" IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';



COMMENT ON COLUMN "auth"."sso_providers"."resource_id" IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';



CREATE TABLE IF NOT EXISTS "auth"."users" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "aud" character varying(255),
    "role" character varying(255),
    "email" character varying(255),
    "encrypted_password" character varying(255),
    "email_confirmed_at" timestamp with time zone,
    "invited_at" timestamp with time zone,
    "confirmation_token" character varying(255),
    "confirmation_sent_at" timestamp with time zone,
    "recovery_token" character varying(255),
    "recovery_sent_at" timestamp with time zone,
    "email_change_token_new" character varying(255),
    "email_change" character varying(255),
    "email_change_sent_at" timestamp with time zone,
    "last_sign_in_at" timestamp with time zone,
    "raw_app_meta_data" "jsonb",
    "raw_user_meta_data" "jsonb",
    "is_super_admin" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "phone" "text" DEFAULT NULL::character varying,
    "phone_confirmed_at" timestamp with time zone,
    "phone_change" "text" DEFAULT ''::character varying,
    "phone_change_token" character varying(255) DEFAULT ''::character varying,
    "phone_change_sent_at" timestamp with time zone,
    "confirmed_at" timestamp with time zone GENERATED ALWAYS AS (LEAST("email_confirmed_at", "phone_confirmed_at")) STORED,
    "email_change_token_current" character varying(255) DEFAULT ''::character varying,
    "email_change_confirm_status" smallint DEFAULT 0,
    "banned_until" timestamp with time zone,
    "reauthentication_token" character varying(255) DEFAULT ''::character varying,
    "reauthentication_sent_at" timestamp with time zone,
    "is_sso_user" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_anonymous" boolean DEFAULT false NOT NULL,
    CONSTRAINT "users_email_change_confirm_status_check" CHECK ((("email_change_confirm_status" >= 0) AND ("email_change_confirm_status" <= 2)))
);


ALTER TABLE "auth"."users" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."users" IS 'Auth: Stores user login data within a secure schema.';



COMMENT ON COLUMN "auth"."users"."is_sso_user" IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';



CREATE TABLE IF NOT EXISTS "public"."additional_fees" (
    "id" integer NOT NULL,
    "fee_type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "amount" numeric(10,2) NOT NULL,
    "is_percentage" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."additional_fees" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."additional_fees_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."additional_fees_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."additional_fees_id_seq" OWNED BY "public"."additional_fees"."id";



CREATE TABLE IF NOT EXISTS "public"."airports" (
    "code" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "primary_zip" "text" NOT NULL
);


ALTER TABLE "public"."airports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "customer_email" "text" NOT NULL,
    "customer_phone" "text",
    "customer_first_name" "text",
    "customer_last_name" "text",
    "customer_company" "text",
    "pickup_address" "text" NOT NULL,
    "destination_address" "text",
    "pickup_date" "date" NOT NULL,
    "pickup_time" time without time zone NOT NULL,
    "passengers" integer DEFAULT 1 NOT NULL,
    "flight_number" "text",
    "special_instructions" "text",
    "vehicle_type" "text" NOT NULL,
    "vehicle_name" "text" NOT NULL,
    "base_price" numeric(10,2) NOT NULL,
    "service_fee" numeric(10,2) DEFAULT 0 NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "stripe_payment_intent_id" "text" NOT NULL,
    "stripe_payment_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_method" "text" DEFAULT 'card'::"text",
    "currency" "text" DEFAULT 'usd'::"text",
    "booking_status" "text" DEFAULT 'confirmed'::"text" NOT NULL,
    "booking_type" "text" DEFAULT 'standard'::"text" NOT NULL,
    "booking_source" "text" DEFAULT 'website'::"text",
    "admin_notes" "text",
    "confirmation_sent_at" timestamp with time zone,
    "reminder_sent_at" timestamp with time zone,
    "pickup_zipcode" "text",
    "destination_zipcode" "text",
    "pickup_city" "text",
    "destination_city" "text",
    "pickup_state" "text",
    "destination_state" "text",
    "pickup_place_id" "text",
    "destination_place_id" "text",
    "pickup_latitude" numeric(10,8),
    "pickup_longitude" numeric(11,8),
    "destination_latitude" numeric(10,8),
    "destination_longitude" numeric(11,8),
    "base_rate" numeric(10,2),
    "tolls_amount" numeric(10,2) DEFAULT 0,
    "extras_amount" numeric(10,2) DEFAULT 0,
    "gratuity_amount" numeric(10,2) DEFAULT 0,
    "subtotal_amount" numeric(10,2),
    "extra_stops_count" integer DEFAULT 0,
    "extra_stops_fee" numeric(10,2) DEFAULT 0,
    "international_arrival_fee" numeric(10,2) DEFAULT 0,
    "early_late_pickup_fee" numeric(10,2) DEFAULT 0,
    "holiday_fee" numeric(10,2) DEFAULT 0,
    "dfw_toll_fee" numeric(10,2) DEFAULT 0,
    "trip_type" "text" DEFAULT 'one-way'::"text",
    "trip_duration" "text",
    "is_quote" boolean DEFAULT false,
    "customer_city" "text",
    "customer_state" "text",
    "customer_zipcode" "text",
    "driver_assigned" "uuid",
    "driver_notes" "text",
    "estimated_duration" interval,
    "actual_pickup_time" timestamp with time zone,
    "actual_dropoff_time" timestamp with time zone,
    "booking_number" "text",
    "duration" "text",
    "early_pickup_requested" boolean DEFAULT false,
    CONSTRAINT "bookings_booking_status_check" CHECK (("booking_status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'cancelled'::"text", 'completed'::"text", 'no_show'::"text"]))),
    CONSTRAINT "bookings_booking_type_check" CHECK (("booking_type" = ANY (ARRAY['standard'::"text", 'quote'::"text"]))),
    CONSTRAINT "bookings_trip_type_check" CHECK (("trip_type" = ANY (ARRAY['one-way'::"text", 'hourly'::"text"])))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


COMMENT ON TABLE "public"."bookings" IS 'Main bookings table storing all reservation data with detailed pricing breakdown';



COMMENT ON COLUMN "public"."bookings"."service_fee" IS 'Deprecated - use pricing breakdown columns instead';



COMMENT ON COLUMN "public"."bookings"."total_amount" IS 'Final total including all fees and gratuity';



COMMENT ON COLUMN "public"."bookings"."stripe_payment_intent_id" IS 'Stripe PaymentIntent ID for payment tracking';



COMMENT ON COLUMN "public"."bookings"."base_rate" IS 'Base fare before extras and gratuity';



CREATE TABLE IF NOT EXISTS "public"."pricing_grid" (
    "id" integer NOT NULL,
    "vehicle_id" "text" NOT NULL,
    "service_type" "text" NOT NULL,
    "zone" integer,
    "rate" numeric(10,2) NOT NULL,
    "min_hours" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "pricing_grid_service_type_check" CHECK (("service_type" = ANY (ARRAY['one-way'::"text", 'hourly'::"text"])))
);


ALTER TABLE "public"."pricing_grid" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."pricing_grid_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."pricing_grid_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."pricing_grid_id_seq" OWNED BY "public"."pricing_grid"."id";



CREATE TABLE IF NOT EXISTS "public"."vehicle_types" (
    "id" integer NOT NULL,
    "vehicle_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "capacity" integer NOT NULL,
    "luggage_description" "text" NOT NULL,
    "special_notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vehicle_types" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."pricing_with_vehicle_details" AS
 SELECT "vt"."vehicle_id",
    "vt"."name" AS "vehicle_name",
    COALESCE("vt"."description", ''::"text") AS "vehicle_description",
    "vt"."capacity",
    COALESCE("vt"."luggage_description", ''::"text") AS "luggage_description",
    COALESCE("vt"."special_notes", ''::"text") AS "special_notes",
    "pg"."service_type",
    "pg"."zone",
    "pg"."rate",
    "pg"."min_hours",
    (LEAST(("pg"."is_active")::integer, ("vt"."is_active")::integer))::boolean AS "is_active"
   FROM ("public"."pricing_grid" "pg"
     JOIN "public"."vehicle_types" "vt" ON (("vt"."vehicle_id" = "pg"."vehicle_id")));


ALTER VIEW "public"."pricing_with_vehicle_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "quote_type" "text" DEFAULT 'quote'::"text" NOT NULL,
    "quote_source" "text" DEFAULT 'website'::"text" NOT NULL,
    "customer_email" "text" NOT NULL,
    "customer_phone" "text",
    "customer_first_name" "text",
    "customer_last_name" "text",
    "customer_company" "text",
    "trip_type" "text" DEFAULT 'one-way'::"text" NOT NULL,
    "pickup_address" "text" NOT NULL,
    "destination_address" "text",
    "pickup_date" "date" NOT NULL,
    "pickup_time" time without time zone NOT NULL,
    "trip_duration" "text",
    "passengers" integer DEFAULT 1 NOT NULL,
    "pickup_zipcode" "text",
    "destination_zipcode" "text",
    "pickup_city" "text",
    "destination_city" "text",
    "pickup_state" "text",
    "destination_state" "text",
    "pickup_place_id" "text",
    "destination_place_id" "text",
    "pickup_latitude" numeric,
    "pickup_longitude" numeric,
    "destination_latitude" numeric,
    "destination_longitude" numeric,
    "vehicle_type" "text" DEFAULT 'sedan'::"text" NOT NULL,
    "vehicle_name" "text" DEFAULT 'Standard Vehicle'::"text" NOT NULL,
    "flight_number" "text",
    "special_instructions" "text",
    "base_rate" numeric(10,2) DEFAULT 0 NOT NULL,
    "tolls_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "extras_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "gratuity_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "subtotal_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "total_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'usd'::"text" NOT NULL,
    "extra_stops_count" integer DEFAULT 0 NOT NULL,
    "extra_stops_fee" numeric(10,2) DEFAULT 0 NOT NULL,
    "international_arrival_fee" numeric(10,2) DEFAULT 0 NOT NULL,
    "early_late_pickup_fee" numeric(10,2) DEFAULT 0 NOT NULL,
    "holiday_fee" numeric(10,2) DEFAULT 0 NOT NULL,
    "dfw_toll_fee" numeric(10,2) DEFAULT 0 NOT NULL,
    "quote_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "stripe_payment_intent_id" "text",
    "converted_booking_id" "uuid",
    "converted_at" timestamp with time zone,
    "admin_notes" "text",
    "quote_sent_at" timestamp with time zone,
    "follow_up_sent_at" timestamp with time zone,
    "recommendations" "jsonb" DEFAULT '[]'::"jsonb",
    "form_data" "jsonb" DEFAULT '{}'::"jsonb",
    "quote_number" "text",
    CONSTRAINT "quotes_quote_status_check" CHECK (("quote_status" = ANY (ARRAY['pending'::"text", 'sent'::"text", 'accepted'::"text", 'declined'::"text", 'expired'::"text", 'converted'::"text"]))),
    CONSTRAINT "quotes_quote_type_check" CHECK (("quote_type" = ANY (ARRAY['booking-quote'::"text", 'get-quote'::"text"]))),
    CONSTRAINT "quotes_trip_type_check" CHECK (("trip_type" = ANY (ARRAY['one-way'::"text", 'hourly'::"text"])))
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


COMMENT ON TABLE "public"."quotes" IS 'Stores quote requests from both booking-quote and get-quote flows';



COMMENT ON COLUMN "public"."quotes"."quote_type" IS 'booking-quote: from booking flow, get-quote: from dedicated quote flow';



COMMENT ON COLUMN "public"."quotes"."quote_status" IS 'Workflow status of the quote request';



COMMENT ON COLUMN "public"."quotes"."expires_at" IS 'When the quote expires (default 7 days)';



CREATE TABLE IF NOT EXISTS "public"."user" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "company" "text",
    "user_type" character varying
);


ALTER TABLE "public"."user" OWNER TO "postgres";


ALTER TABLE "public"."user" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE SEQUENCE IF NOT EXISTS "public"."vehicle_types_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."vehicle_types_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."vehicle_types_id_seq" OWNED BY "public"."vehicle_types"."id";



CREATE TABLE IF NOT EXISTS "public"."zones" (
    "zip_code" bigint NOT NULL,
    "city" "text",
    "dfw_zone" bigint,
    "dal_zone" bigint
);


ALTER TABLE "public"."zones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "storage"."buckets" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "owner" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "public" boolean DEFAULT false,
    "avif_autodetection" boolean DEFAULT false,
    "file_size_limit" bigint,
    "allowed_mime_types" "text"[],
    "owner_id" "text"
);


ALTER TABLE "storage"."buckets" OWNER TO "supabase_storage_admin";


COMMENT ON COLUMN "storage"."buckets"."owner" IS 'Field is deprecated, use owner_id instead';



CREATE TABLE IF NOT EXISTS "storage"."migrations" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "hash" character varying(40) NOT NULL,
    "executed_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "storage"."migrations" OWNER TO "supabase_storage_admin";


CREATE TABLE IF NOT EXISTS "storage"."objects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bucket_id" "text",
    "name" "text",
    "owner" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_accessed_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb",
    "path_tokens" "text"[] GENERATED ALWAYS AS ("string_to_array"("name", '/'::"text")) STORED,
    "version" "text",
    "owner_id" "text",
    "user_metadata" "jsonb"
);


ALTER TABLE "storage"."objects" OWNER TO "supabase_storage_admin";


COMMENT ON COLUMN "storage"."objects"."owner" IS 'Field is deprecated, use owner_id instead';



CREATE TABLE IF NOT EXISTS "storage"."s3_multipart_uploads" (
    "id" "text" NOT NULL,
    "in_progress_size" bigint DEFAULT 0 NOT NULL,
    "upload_signature" "text" NOT NULL,
    "bucket_id" "text" NOT NULL,
    "key" "text" NOT NULL COLLATE "pg_catalog"."C",
    "version" "text" NOT NULL,
    "owner_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_metadata" "jsonb"
);


ALTER TABLE "storage"."s3_multipart_uploads" OWNER TO "supabase_storage_admin";


CREATE TABLE IF NOT EXISTS "storage"."s3_multipart_uploads_parts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "upload_id" "text" NOT NULL,
    "size" bigint DEFAULT 0 NOT NULL,
    "part_number" integer NOT NULL,
    "bucket_id" "text" NOT NULL,
    "key" "text" NOT NULL COLLATE "pg_catalog"."C",
    "etag" "text" NOT NULL,
    "owner_id" "text",
    "version" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "storage"."s3_multipart_uploads_parts" OWNER TO "supabase_storage_admin";


ALTER TABLE ONLY "auth"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT "nextval"('"auth"."refresh_tokens_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."additional_fees" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."additional_fees_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."pricing_grid" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."pricing_grid_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."vehicle_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."vehicle_types_id_seq"'::"regclass");



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "amr_id_pk" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."audit_log_entries"
    ADD CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."flow_state"
    ADD CONSTRAINT "flow_state_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_provider_id_provider_unique" UNIQUE ("provider_id", "provider");



ALTER TABLE ONLY "auth"."instances"
    ADD CONSTRAINT "instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_authentication_method_pkey" UNIQUE ("session_id", "authentication_method");



ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_last_challenged_at_key" UNIQUE ("last_challenged_at");



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."oauth_clients"
    ADD CONSTRAINT "oauth_clients_client_id_key" UNIQUE ("client_id");



ALTER TABLE ONLY "auth"."oauth_clients"
    ADD CONSTRAINT "oauth_clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_token_unique" UNIQUE ("token");



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_entity_id_key" UNIQUE ("entity_id");



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."sso_providers"
    ADD CONSTRAINT "sso_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."additional_fees"
    ADD CONSTRAINT "additional_fees_fee_type_key" UNIQUE ("fee_type");



ALTER TABLE ONLY "public"."additional_fees"
    ADD CONSTRAINT "additional_fees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."airports"
    ADD CONSTRAINT "airports_pkey" PRIMARY KEY ("code");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_booking_number_key" UNIQUE ("booking_number");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_stripe_payment_intent_id_key" UNIQUE ("stripe_payment_intent_id");



ALTER TABLE ONLY "public"."pricing_grid"
    ADD CONSTRAINT "pricing_grid_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_grid"
    ADD CONSTRAINT "pricing_grid_vehicle_id_service_type_zone_key" UNIQUE ("vehicle_id", "service_type", "zone");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_quote_number_key" UNIQUE ("quote_number");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_stripe_payment_intent_id_key" UNIQUE ("stripe_payment_intent_id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicle_types"
    ADD CONSTRAINT "vehicle_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicle_types"
    ADD CONSTRAINT "vehicle_types_vehicle_id_key" UNIQUE ("vehicle_id");



ALTER TABLE ONLY "public"."zones"
    ADD CONSTRAINT "zones_pkey" PRIMARY KEY ("zip_code");



ALTER TABLE ONLY "storage"."buckets"
    ADD CONSTRAINT "buckets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."migrations"
    ADD CONSTRAINT "migrations_name_key" UNIQUE ("name");



ALTER TABLE ONLY "storage"."migrations"
    ADD CONSTRAINT "migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."objects"
    ADD CONSTRAINT "objects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads"
    ADD CONSTRAINT "s3_multipart_uploads_pkey" PRIMARY KEY ("id");



CREATE INDEX "audit_logs_instance_id_idx" ON "auth"."audit_log_entries" USING "btree" ("instance_id");



CREATE UNIQUE INDEX "confirmation_token_idx" ON "auth"."users" USING "btree" ("confirmation_token") WHERE (("confirmation_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "email_change_token_current_idx" ON "auth"."users" USING "btree" ("email_change_token_current") WHERE (("email_change_token_current")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "email_change_token_new_idx" ON "auth"."users" USING "btree" ("email_change_token_new") WHERE (("email_change_token_new")::"text" !~ '^[0-9 ]*$'::"text");



CREATE INDEX "factor_id_created_at_idx" ON "auth"."mfa_factors" USING "btree" ("user_id", "created_at");



CREATE INDEX "flow_state_created_at_idx" ON "auth"."flow_state" USING "btree" ("created_at" DESC);



CREATE INDEX "identities_email_idx" ON "auth"."identities" USING "btree" ("email" "text_pattern_ops");



COMMENT ON INDEX "auth"."identities_email_idx" IS 'Auth: Ensures indexed queries on the email column';



CREATE INDEX "identities_user_id_idx" ON "auth"."identities" USING "btree" ("user_id");



CREATE INDEX "idx_auth_code" ON "auth"."flow_state" USING "btree" ("auth_code");



CREATE INDEX "idx_user_id_auth_method" ON "auth"."flow_state" USING "btree" ("user_id", "authentication_method");



CREATE INDEX "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges" USING "btree" ("created_at" DESC);



CREATE UNIQUE INDEX "mfa_factors_user_friendly_name_unique" ON "auth"."mfa_factors" USING "btree" ("friendly_name", "user_id") WHERE (TRIM(BOTH FROM "friendly_name") <> ''::"text");



CREATE INDEX "mfa_factors_user_id_idx" ON "auth"."mfa_factors" USING "btree" ("user_id");



CREATE INDEX "oauth_clients_client_id_idx" ON "auth"."oauth_clients" USING "btree" ("client_id");



CREATE INDEX "oauth_clients_deleted_at_idx" ON "auth"."oauth_clients" USING "btree" ("deleted_at");



CREATE INDEX "one_time_tokens_relates_to_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("relates_to");



CREATE INDEX "one_time_tokens_token_hash_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("token_hash");



CREATE UNIQUE INDEX "one_time_tokens_user_id_token_type_key" ON "auth"."one_time_tokens" USING "btree" ("user_id", "token_type");



CREATE UNIQUE INDEX "reauthentication_token_idx" ON "auth"."users" USING "btree" ("reauthentication_token") WHERE (("reauthentication_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "recovery_token_idx" ON "auth"."users" USING "btree" ("recovery_token") WHERE (("recovery_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE INDEX "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id");



CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id", "user_id");



CREATE INDEX "refresh_tokens_parent_idx" ON "auth"."refresh_tokens" USING "btree" ("parent");



CREATE INDEX "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens" USING "btree" ("session_id", "revoked");



CREATE INDEX "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens" USING "btree" ("updated_at" DESC);



CREATE INDEX "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers" USING "btree" ("sso_provider_id");



CREATE INDEX "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states" USING "btree" ("created_at" DESC);



CREATE INDEX "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states" USING "btree" ("for_email");



CREATE INDEX "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states" USING "btree" ("sso_provider_id");



CREATE INDEX "sessions_not_after_idx" ON "auth"."sessions" USING "btree" ("not_after" DESC);



CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "sso_domains_domain_idx" ON "auth"."sso_domains" USING "btree" ("lower"("domain"));



CREATE INDEX "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains" USING "btree" ("sso_provider_id");



CREATE UNIQUE INDEX "sso_providers_resource_id_idx" ON "auth"."sso_providers" USING "btree" ("lower"("resource_id"));



CREATE INDEX "sso_providers_resource_id_pattern_idx" ON "auth"."sso_providers" USING "btree" ("resource_id" "text_pattern_ops");



CREATE UNIQUE INDEX "unique_phone_factor_per_user" ON "auth"."mfa_factors" USING "btree" ("user_id", "phone");



CREATE INDEX "user_id_created_at_idx" ON "auth"."sessions" USING "btree" ("user_id", "created_at");



CREATE UNIQUE INDEX "users_email_partial_key" ON "auth"."users" USING "btree" ("email") WHERE ("is_sso_user" = false);



COMMENT ON INDEX "auth"."users_email_partial_key" IS 'Auth: A partial unique index that applies only when is_sso_user is false';



CREATE INDEX "users_instance_id_email_idx" ON "auth"."users" USING "btree" ("instance_id", "lower"(("email")::"text"));



CREATE INDEX "users_instance_id_idx" ON "auth"."users" USING "btree" ("instance_id");



CREATE INDEX "users_is_anonymous_idx" ON "auth"."users" USING "btree" ("is_anonymous");



CREATE INDEX "idx_additional_fees_active" ON "public"."additional_fees" USING "btree" ("is_active");



CREATE INDEX "idx_bookings_booking_number" ON "public"."bookings" USING "btree" ("booking_number");



CREATE INDEX "idx_bookings_customer_email" ON "public"."bookings" USING "btree" ("customer_email");



CREATE INDEX "idx_bookings_destination_zipcode" ON "public"."bookings" USING "btree" ("destination_zipcode");



CREATE INDEX "idx_bookings_driver_assigned" ON "public"."bookings" USING "btree" ("driver_assigned");



CREATE INDEX "idx_bookings_early_pickup_requested" ON "public"."bookings" USING "btree" ("early_pickup_requested");



CREATE INDEX "idx_bookings_is_quote" ON "public"."bookings" USING "btree" ("is_quote");



CREATE INDEX "idx_bookings_pickup_city" ON "public"."bookings" USING "btree" ("pickup_city");



CREATE INDEX "idx_bookings_pickup_date" ON "public"."bookings" USING "btree" ("pickup_date");



CREATE INDEX "idx_bookings_pickup_zipcode" ON "public"."bookings" USING "btree" ("pickup_zipcode");



CREATE INDEX "idx_bookings_status" ON "public"."bookings" USING "btree" ("booking_status");



CREATE INDEX "idx_bookings_stripe_payment_intent" ON "public"."bookings" USING "btree" ("stripe_payment_intent_id");



CREATE INDEX "idx_bookings_trip_type" ON "public"."bookings" USING "btree" ("trip_type");



CREATE INDEX "idx_bookings_user_id" ON "public"."bookings" USING "btree" ("user_id");



CREATE INDEX "idx_pricing_grid_active" ON "public"."pricing_grid" USING "btree" ("is_active");



CREATE INDEX "idx_pricing_grid_combo" ON "public"."pricing_grid" USING "btree" ("service_type", "zone");



CREATE INDEX "idx_pricing_grid_vehicle" ON "public"."pricing_grid" USING "btree" ("vehicle_id");



CREATE INDEX "idx_pricing_grid_vehicle_service" ON "public"."pricing_grid" USING "btree" ("vehicle_id", "service_type");



CREATE INDEX "idx_pricing_grid_zone" ON "public"."pricing_grid" USING "btree" ("zone");



CREATE INDEX "idx_quotes_created_at" ON "public"."quotes" USING "btree" ("created_at");



CREATE INDEX "idx_quotes_customer_email" ON "public"."quotes" USING "btree" ("customer_email");



CREATE INDEX "idx_quotes_pickup_date" ON "public"."quotes" USING "btree" ("pickup_date");



CREATE INDEX "idx_quotes_quote_number" ON "public"."quotes" USING "btree" ("quote_number");



CREATE INDEX "idx_quotes_quote_status" ON "public"."quotes" USING "btree" ("quote_status");



CREATE INDEX "idx_quotes_quote_type" ON "public"."quotes" USING "btree" ("quote_type");



CREATE INDEX "idx_quotes_stripe_payment_intent_id" ON "public"."quotes" USING "btree" ("stripe_payment_intent_id") WHERE ("stripe_payment_intent_id" IS NOT NULL);



CREATE INDEX "idx_zones_dal" ON "public"."zones" USING "btree" ("dal_zone");



CREATE INDEX "idx_zones_dal_zone" ON "public"."zones" USING "btree" ("dal_zone");



CREATE INDEX "idx_zones_dfw" ON "public"."zones" USING "btree" ("dfw_zone");



CREATE INDEX "idx_zones_dfw_zone" ON "public"."zones" USING "btree" ("dfw_zone");



CREATE UNIQUE INDEX "bname" ON "storage"."buckets" USING "btree" ("name");



CREATE UNIQUE INDEX "bucketid_objname" ON "storage"."objects" USING "btree" ("bucket_id", "name");



CREATE INDEX "idx_multipart_uploads_list" ON "storage"."s3_multipart_uploads" USING "btree" ("bucket_id", "key", "created_at");



CREATE INDEX "idx_objects_bucket_id_name" ON "storage"."objects" USING "btree" ("bucket_id", "name" COLLATE "C");



CREATE INDEX "name_prefix_search" ON "storage"."objects" USING "btree" ("name" "text_pattern_ops");



CREATE OR REPLACE TRIGGER "update_additional_fees_updated_at" BEFORE UPDATE ON "public"."additional_fees" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_bookings_updated_at" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pricing_grid_updated_at" BEFORE UPDATE ON "public"."pricing_grid" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_quotes_updated_at" BEFORE UPDATE ON "public"."quotes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vehicle_types_updated_at" BEFORE UPDATE ON "public"."vehicle_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_zones_updated_at" BEFORE UPDATE ON "public"."zones" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_objects_updated_at" BEFORE UPDATE ON "storage"."objects" FOR EACH ROW EXECUTE FUNCTION "storage"."update_updated_at_column"();



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_driver_assigned_fkey" FOREIGN KEY ("driver_assigned") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_grid"
    ADD CONSTRAINT "pricing_grid_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle_types"("vehicle_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_converted_booking_id_fkey" FOREIGN KEY ("converted_booking_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "storage"."objects"
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads"
    ADD CONSTRAINT "s3_multipart_uploads_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "storage"."s3_multipart_uploads"("id") ON DELETE CASCADE;



ALTER TABLE "auth"."audit_log_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."flow_state" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."identities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_amr_claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_challenges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_factors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."one_time_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."refresh_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."saml_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."saml_relay_states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."schema_migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sso_domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sso_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Allow admin full access" ON "public"."quotes" USING (true);



CREATE POLICY "Allow public quote creation" ON "public"."quotes" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public quote read" ON "public"."quotes" FOR SELECT USING (true);



CREATE POLICY "Service role can manage all bookings" ON "public"."bookings" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can create own bookings" ON "public"."bookings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own bookings" ON "public"."bookings" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."additional_fees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fees_read" ON "public"."additional_fees" FOR SELECT USING (true);



ALTER TABLE "public"."pricing_grid" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pricing_grid_read" ON "public"."pricing_grid" FOR SELECT USING (true);



ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicle_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "vehicle_types_read" ON "public"."vehicle_types" FOR SELECT USING (true);



ALTER TABLE "public"."zones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "zones_read" ON "public"."zones" FOR SELECT USING (true);



ALTER TABLE "storage"."buckets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."objects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."s3_multipart_uploads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."s3_multipart_uploads_parts" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "auth" TO "anon";
GRANT USAGE ON SCHEMA "auth" TO "authenticated";
GRANT USAGE ON SCHEMA "auth" TO "service_role";
GRANT ALL ON SCHEMA "auth" TO "supabase_auth_admin";
GRANT ALL ON SCHEMA "auth" TO "dashboard_user";
GRANT USAGE ON SCHEMA "auth" TO "postgres";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT USAGE ON SCHEMA "storage" TO "postgres" WITH GRANT OPTION;
GRANT USAGE ON SCHEMA "storage" TO "anon";
GRANT USAGE ON SCHEMA "storage" TO "authenticated";
GRANT USAGE ON SCHEMA "storage" TO "service_role";
GRANT ALL ON SCHEMA "storage" TO "supabase_storage_admin";
GRANT ALL ON SCHEMA "storage" TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."email"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."jwt"() TO "postgres";
GRANT ALL ON FUNCTION "auth"."jwt"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."role"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."uid"() TO "dashboard_user";



GRANT ALL ON FUNCTION "public"."bulk_update_pricing"("pricing_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."bulk_update_pricing"("pricing_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bulk_update_pricing"("pricing_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_route_pricing"("p_pickup_zip" "text", "p_dropoff_zip" "text", "p_service_type" "text", "p_hours" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_route_pricing"("p_pickup_zip" "text", "p_dropoff_zip" "text", "p_service_type" "text", "p_hours" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_route_pricing"("p_pickup_zip" "text", "p_dropoff_zip" "text", "p_service_type" "text", "p_hours" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vehicle_pricing_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_vehicle_pricing_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vehicle_pricing_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_additional_fee"("p_fee_type" "text", "p_amount" numeric, "p_is_percentage" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."update_additional_fee"("p_fee_type" "text", "p_amount" numeric, "p_is_percentage" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_additional_fee"("p_fee_type" "text", "p_amount" numeric, "p_is_percentage" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_hourly_pricing"("p_vehicle_id" "text", "p_rate" numeric, "p_min_hours" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_hourly_pricing"("p_vehicle_id" "text", "p_rate" numeric, "p_min_hours" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_hourly_pricing"("p_vehicle_id" "text", "p_rate" numeric, "p_min_hours" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_oneway_pricing"("p_vehicle_id" "text", "p_zone" integer, "p_rate" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_oneway_pricing"("p_vehicle_id" "text", "p_zone" integer, "p_rate" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_oneway_pricing"("p_vehicle_id" "text", "p_zone" integer, "p_rate" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "auth"."audit_log_entries" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."audit_log_entries" TO "postgres";
GRANT SELECT ON TABLE "auth"."audit_log_entries" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."flow_state" TO "postgres";
GRANT SELECT ON TABLE "auth"."flow_state" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."flow_state" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."identities" TO "postgres";
GRANT SELECT ON TABLE "auth"."identities" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."identities" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."instances" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."instances" TO "postgres";
GRANT SELECT ON TABLE "auth"."instances" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_amr_claims" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_amr_claims" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_amr_claims" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_challenges" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_challenges" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_challenges" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_factors" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_factors" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_factors" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."oauth_clients" TO "postgres";
GRANT ALL ON TABLE "auth"."oauth_clients" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."one_time_tokens" TO "postgres";
GRANT SELECT ON TABLE "auth"."one_time_tokens" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."one_time_tokens" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."refresh_tokens" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."refresh_tokens" TO "postgres";
GRANT SELECT ON TABLE "auth"."refresh_tokens" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON SEQUENCE "auth"."refresh_tokens_id_seq" TO "dashboard_user";
GRANT ALL ON SEQUENCE "auth"."refresh_tokens_id_seq" TO "postgres";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."saml_providers" TO "postgres";
GRANT SELECT ON TABLE "auth"."saml_providers" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."saml_providers" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."saml_relay_states" TO "postgres";
GRANT SELECT ON TABLE "auth"."saml_relay_states" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."saml_relay_states" TO "dashboard_user";



GRANT SELECT ON TABLE "auth"."schema_migrations" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sessions" TO "postgres";
GRANT SELECT ON TABLE "auth"."sessions" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sessions" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sso_domains" TO "postgres";
GRANT SELECT ON TABLE "auth"."sso_domains" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sso_domains" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sso_providers" TO "postgres";
GRANT SELECT ON TABLE "auth"."sso_providers" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sso_providers" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."users" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."users" TO "postgres";
GRANT SELECT ON TABLE "auth"."users" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON TABLE "public"."additional_fees" TO "anon";
GRANT ALL ON TABLE "public"."additional_fees" TO "authenticated";
GRANT ALL ON TABLE "public"."additional_fees" TO "service_role";



GRANT ALL ON SEQUENCE "public"."additional_fees_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."additional_fees_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."additional_fees_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."airports" TO "anon";
GRANT ALL ON TABLE "public"."airports" TO "authenticated";
GRANT ALL ON TABLE "public"."airports" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_grid" TO "anon";
GRANT ALL ON TABLE "public"."pricing_grid" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_grid" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pricing_grid_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pricing_grid_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pricing_grid_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."vehicle_types" TO "anon";
GRANT ALL ON TABLE "public"."vehicle_types" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicle_types" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_with_vehicle_details" TO "anon";
GRANT ALL ON TABLE "public"."pricing_with_vehicle_details" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_with_vehicle_details" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vehicle_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vehicle_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vehicle_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."zones" TO "anon";
GRANT ALL ON TABLE "public"."zones" TO "authenticated";
GRANT ALL ON TABLE "public"."zones" TO "service_role";



GRANT ALL ON TABLE "storage"."buckets" TO "anon";
GRANT ALL ON TABLE "storage"."buckets" TO "authenticated";
GRANT ALL ON TABLE "storage"."buckets" TO "service_role";
GRANT ALL ON TABLE "storage"."buckets" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON TABLE "storage"."objects" TO "anon";
GRANT ALL ON TABLE "storage"."objects" TO "authenticated";
GRANT ALL ON TABLE "storage"."objects" TO "service_role";
GRANT ALL ON TABLE "storage"."objects" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON TABLE "storage"."s3_multipart_uploads" TO "service_role";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads" TO "authenticated";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads" TO "anon";



GRANT ALL ON TABLE "storage"."s3_multipart_uploads_parts" TO "service_role";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads_parts" TO "authenticated";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads_parts" TO "anon";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON SEQUENCES TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON FUNCTIONS TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON TABLES TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "service_role";



RESET ALL;
