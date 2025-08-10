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

type InputPayload = {
  pickup_zip: string;
  dropoff_zip?: string;
  service_type: "one-way" | "hourly"; // only frontend-defined types now
  vehicle_id: string;
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
    console.log("SUPABASE LOCAL");
    let body: Partial<InputPayload> = {};
    try {
      body = await req.json();
    } catch (_) {
      return err("BAD_JSON", "Invalid JSON body");
    }

    if (!body.pickup_zip || !body.service_type || !body.vehicle_id) {
      return err(
        "MISSING_FIELDS",
        "Missing required fields in payload.",
        400,
        { required: ["pickup_zip", "service_type", "vehicle_id"] },
      );
    }

    const mode = normalizeServiceType(body.service_type);
    if (!mode) {
      return err(
        "INVALID_SERVICE_TYPE",
        "Invalid service_type. Use 'one-way' or 'hourly'.",
      );
    }

    const dbServiceType = mode; // same names in DB now

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return err("MISSING_ENV", "Missing Supabase env vars", 500);
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    });

    const vehicleId = body.vehicle_id;

    if (mode === "one-way") {
      if (!body.dropoff_zip) {
        return err(
          "MISSING_DROPOFF_ZIP",
          "dropoff_zip is required for one-way trips.",
        );
      }

      const { data: pickupZoneArr, error: pErr } = await supabase
        .from("zones")
        .select("zone")
        .eq("zip_code", body.pickup_zip)
        .limit(1);
      const { data: dropoffZoneArr, error: dErr } = await supabase
        .from("zones")
        .select("zone")
        .eq("zip_code", body.dropoff_zip)
        .limit(1);

      const pickupZoneRow = pickupZoneArr && pickupZoneArr[0];
      const dropoffZoneRow = dropoffZoneArr && dropoffZoneArr[0];

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
        });
      }

      const zoneUsed = Math.max(pickupZoneRow.zone, dropoffZoneRow.zone);

      const { data: priceRow, error: priceErr } = await supabase
        .from("pricing_grid")
        .select("vehicle_id, vehicle_type, zone, service_type, rate")
        .eq("service_type", dbServiceType)
        .eq("vehicle_id", vehicleId)
        .eq("zone", zoneUsed)
        .maybeSingle();

      if (priceErr) {
        return err("DB_ERROR_PRICING", "Error fetching pricing.");
      }
      if (!priceRow) {
        return err(
          "NO_PRICING",
          "Pricing not available for selected vehicle and route.",
          404,
          { zone_used: zoneUsed },
        );
      }

      const total = Number(priceRow.rate);

      return json({
        service_type: mode,
        vehicle_id: priceRow.vehicle_id,
        vehicle_type: priceRow.vehicle_type,
        zone_used: zoneUsed,
        base_rate: total,
        rate: total,
        total,
        extra_charges: [],
      });
    }

    const hoursRequestedRaw = body.hours_requested ?? body.hours ?? 0;
    const hoursRequested = Math.max(0, Number(hoursRequestedRaw));

    const { data: hourlyRow, error: hourlyErr } = await supabase
      .from("pricing_grid")
      .select("vehicle_id, vehicle_type, service_type, rate, min_hours")
      .eq("service_type", dbServiceType)
      .eq("vehicle_id", vehicleId)
      .maybeSingle();

    if (hourlyErr) {
      return err("DB_ERROR_PRICING", "Error fetching pricing (hourly).");
    }
    if (!hourlyRow) {
      return err(
        "NO_PRICING",
        "Pricing not available for selected vehicle (hourly).",
        404,
      );
    }

    const minHours = Number(hourlyRow.min_hours ?? 0);
    const billableHours = Math.max(hoursRequested, minHours);
    const hourlyRate = Number(hourlyRow.rate);
    const totalCost = Number((billableHours * hourlyRate).toFixed(2));

    return json({
      service_type: mode,
      vehicle_id: hourlyRow.vehicle_id,
      vehicle_type: hourlyRow.vehicle_type,
      hourly_rate: hourlyRate,
      min_hours: minHours,
      hours_requested: hoursRequested,
      billable_hours: billableHours,
      total: totalCost,
      total_cost: totalCost,
      extra_charges: [],
    });
  } catch (e) {
    return err("UNHANDLED", String(e), 500);
  }
});
