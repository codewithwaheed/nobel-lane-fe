// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-debug-pricing",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper responders
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function err(
  code: string,
  message: string,
  status = 400,
  extra: Record<string, any> = {},
) {
  return json({ error: message, error_code: code, ...extra }, status);
}

// DEBUG logger
function dlog(debug: boolean, label: string, obj?: any) {
  if (!debug) return;
  try {
    console.log(
      `[pricing-debug] ${label}`,
      obj === undefined
        ? ""
        : typeof obj === "string"
        ? obj
        : JSON.stringify(obj),
    );
  } catch (e) {
    console.log(`[pricing-debug] ${label} (unserializable)`, String(e));
  }
}

type InputPayload = {
  pickup_zip: string;
  dropoff_zip?: string;
  service_type: "one-way" | "hourly";
  vehicle_id?: string; // optional now, used for legacy compatibility
  hours_requested?: number;
  hours?: number;
};

function normalizeServiceType(
  value: string | undefined,
): "one-way" | "hourly" | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (v === "one-way" || v === "oneway" || v === "one_way") return "one-way";
  if (v === "hourly") return "hourly";
  return undefined;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return err("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    const debug = new URL(req.url).searchParams.get("debug") === "1" ||
      req.headers.get("x-debug-pricing") === "1";
    dlog(debug, "incoming_headers", Object.fromEntries(req.headers.entries()));

    let raw = "";
    try {
      raw = await req.text();
    } catch (_) { /* swallow body read error */ }
    dlog(debug, "raw_body", raw);
    // Reparse because we consumed body
    let body: Partial<InputPayload> = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch (e) {
      dlog(debug, "json_parse_error", String(e));
      return err("BAD_JSON", "Invalid JSON body", 400, debug ? { raw } : {});
    }
    dlog(debug, "parsed_body", body);

    if (!body.pickup_zip || !body.service_type) {
      dlog(debug, "missing_fields", body);
      return err(
        "MISSING_FIELDS",
        "Missing required fields in payload.",
        400,
        { required: ["pickup_zip", "service_type"], received: body },
      );
    }

    const mode = normalizeServiceType(body.service_type);
    dlog(debug, "mode", mode);
    if (!mode) {
      return err(
        "INVALID_SERVICE_TYPE",
        "Invalid service_type. Use 'one-way' or 'hourly'.",
        400,
        debug ? { received: body.service_type } : {},
      );
    }

    const dbServiceType = mode; // same names in DB now

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    dlog(debug, "env_supabase_url", supabaseUrl);
    if (!supabaseUrl || !supabaseAnonKey) {
      return err("MISSING_ENV", "Missing Supabase env vars", 500);
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    });

    const _vehicleId = body.vehicle_id; // Keep for future use if needed

    if (mode === "one-way") {
      if (!body.dropoff_zip) {
        return err(
          "MISSING_DROPOFF_ZIP",
          "dropoff_zip is required for one-way trips.",
          400,
          debug ? { body } : {},
        );
      }

      dlog(debug, "zones_query_pickup", body.pickup_zip);
      const { data: pickupZones, error: pErr } = await supabase
        .from("zones")
        .select("zip_code, zone")
        .eq("zip_code", body.pickup_zip);
      dlog(debug, "zones_result_pickup", { pErr, pickupZones });

      dlog(debug, "zones_query_dropoff", body.dropoff_zip);
      const { data: dropoffZones, error: dErr } = await supabase
        .from("zones")
        .select("zip_code, zone")
        .eq("zip_code", body.dropoff_zip);
      dlog(debug, "zones_result_dropoff", { dErr, dropoffZones });

      const pickupZoneRow = pickupZones?.[0];
      const dropoffZoneRow = dropoffZones?.[0];

      if (pErr || dErr) {
        return err(
          "DB_ERROR_ZONES",
          "Error looking up zones.",
          400,
          debug ? { pickup_error: pErr, dropoff_error: dErr } : {},
        );
      }
      if (!pickupZoneRow?.zone || !dropoffZoneRow?.zone) {
        return err("UNKNOWN_ZIP", "Invalid ZIP code provided.", 400, {
          pickup_found: !!pickupZoneRow?.zone,
          dropoff_found: !!dropoffZoneRow?.zone,
          pickup_rows: debug ? pickupZones : undefined,
          dropoff_rows: debug ? dropoffZones : undefined,
        });
      }

      const zoneUsed = Math.max(pickupZoneRow.zone, dropoffZoneRow.zone);
      dlog(debug, "zone_used", zoneUsed);

      dlog(debug, "pricing_query_all_vehicles", { dbServiceType, zoneUsed });
      const { data: priceRows, error: priceErr } = await supabase
        .from("pricing_grid")
        .select("vehicle_id, vehicle_type, zone, service_type, rate")
        .eq("service_type", dbServiceType)
        .eq("zone", zoneUsed);
      dlog(debug, "pricing_result_all", { priceErr, priceRows });

      if (priceErr) {
        return err(
          "DB_ERROR_PRICING",
          "Error fetching pricing.",
          400,
          debug ? { price_error: priceErr } : {},
        );
      }
      if (!priceRows || priceRows.length === 0) {
        return err(
          "NO_PRICING",
          "No pricing available for this route.",
          404,
          { zone_used: zoneUsed },
        );
      }

      // Return all available vehicles with pricing
      const vehicles = priceRows.map((row) => ({
        vehicle_id: row.vehicle_id,
        vehicle_type: row.vehicle_type,
        base_rate: Number(row.rate),
        rate: Number(row.rate),
        total: Number(row.rate),
      }));

      return json({
        service_type: mode,
        zone_used: zoneUsed,
        vehicles,
        extra_charges: [],
        debug: debug ? { pickupZones, dropoffZones, priceRows } : undefined,
      });
    }

    // hourly
    const hoursRequestedRaw = body.hours_requested ?? body.hours ?? 0;
    const hoursRequested = Math.max(0, Number(hoursRequestedRaw));
    dlog(debug, "hours_requested", { hoursRequestedRaw, hoursRequested });

    const { data: hourlyRows, error: hourlyErr } = await supabase
      .from("pricing_grid")
      .select("vehicle_id, vehicle_type, service_type, rate, min_hours")
      .eq("service_type", dbServiceType);
    dlog(debug, "hourly_pricing_result_all", { hourlyErr, hourlyRows });

    if (hourlyErr) {
      return err(
        "DB_ERROR_PRICING",
        "Error fetching pricing (hourly).",
        400,
        debug ? { hourly_error: hourlyErr } : {},
      );
    }
    if (!hourlyRows || hourlyRows.length === 0) {
      return err(
        "NO_PRICING",
        "No hourly pricing available.",
        404,
      );
    }

    // Return all available vehicles with hourly pricing
    const vehicles = hourlyRows.map((row) => {
      const minHours = Number(row.min_hours ?? 0);
      const billableHours = Math.max(hoursRequested, minHours);
      const hourlyRate = Number(row.rate);
      const totalCost = Number((billableHours * hourlyRate).toFixed(2));

      return {
        vehicle_id: row.vehicle_id,
        vehicle_type: row.vehicle_type,
        hourly_rate: hourlyRate,
        min_hours: minHours,
        hours_requested: hoursRequested,
        billable_hours: billableHours,
        total: totalCost,
        total_cost: totalCost,
      };
    });

    return json({
      service_type: mode,
      vehicles,
      extra_charges: [],
      debug: debug ? { hourlyRows } : undefined,
    });
  } catch (e) {
    console.log("[pricing-debug] unhandled", e);
    return err("UNHANDLED", String(e), 500);
  }
});
