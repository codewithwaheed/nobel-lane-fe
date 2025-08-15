// @ts-nocheck
// supabase/functions/get-pricing/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-debug-pricing",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
function dlog(debug: boolean, label: string, obj?: any) {
  if (!debug) return;
  try {
    console.log(`[pricing-debug] ${label}`, obj ?? "");
  } catch {}
}

type ServiceType = "one-way" | "hourly";
type InputPayload = {
  service_type: ServiceType;
  pickup_zip: string;
  dropoff_zip?: string;
  airport_code?: "DFW" | "DAL";
  hours?: number;
  // flags you might pass; ignored by this endpoint for totals (frontend handles extras)
  is_early_or_late?: boolean;
  is_international_arrival?: boolean;
  is_holiday?: boolean;
  needs_flight_tracking?: boolean;
  extra_stops?: number;
};

const normalizeZip = (z?: string) =>
  (z || "").replace(/\D/g, "").padStart(5, "0");

// Airport anchor ZIPs (change if yours differ)
const DFW_ZIP = "75261";
const DAL_ZIP = "75235";

/** Build hourly payload with computed totals (rate * billableHours) */
async function buildHourlyResponse(
  supabase: any,
  hoursRequestedRaw: any,
  debug: boolean,
) {
  const hoursRequested = Math.max(0, Number(hoursRequestedRaw ?? 0));

  // pricing_grid: vehicle_id, rate, min_hours, is_active where service_type='hourly'
  const { data: hrows, error: hErr } = await supabase
    .from("pricing_grid")
    .select("vehicle_id, rate, min_hours, is_active")
    .eq("service_type", "hourly")
    .eq("is_active", true);

  if (hErr) {
    return err(
      "DB_ERROR_HOURLY",
      "Error fetching hourly pricing.",
      500,
      debug ? { hErr } : {},
    );
  }
  if (!hrows?.length) {
    return err("NO_PRICING", "No hourly pricing available.", 404);
  }

  const ids = [...new Set(hrows.map((r: any) => r.vehicle_id))];
  const { data: vt, error: vtErr } = await supabase
    .from("vehicle_types")
    .select(
      "vehicle_id, name, description, capacity, luggage_description, special_notes, is_active",
    )
    .in("vehicle_id", ids)
    .eq("is_active", true);

  if (vtErr) {
    return err(
      "DB_ERROR_VEHICLES",
      "Error fetching vehicle details.",
      500,
      debug ? { vtErr } : {},
    );
  }
  const vtMap = new Map<string, any>(
    (vt || []).map((v: any) => [v.vehicle_id, v]),
  );

  const vehicles = hrows
    .filter((r: any) => vtMap.has(r.vehicle_id))
    .map((r: any) => {
      const v = vtMap.get(r.vehicle_id);
      const minH = Number(r.min_hours ?? 2);
      const billable = Math.max(hoursRequested, minH);
      const hourlyRate = Number(r.rate);
      const total = Number((hourlyRate * billable).toFixed(2));
      return {
        vehicle_id: r.vehicle_id,
        vehicle_type: v.name,
        vehicle_description: v.description,
        capacity: v.capacity,
        luggage_description: v.luggage_description,
        special_notes: v.special_notes,
        hourly_rate: hourlyRate,
        min_hours: minH,
        hours_requested: hoursRequested,
        billable_hours: billable,
        total,
      };
    });

  return json({ service_type: "hourly", vehicles });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const debug = new URL(req.url).searchParams.get("debug") === "1" ||
    req.headers.get("x-debug-pricing") === "1";

  try {
    if (req.method !== "POST") {
      return err("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || (!serviceKey && !anonKey)) {
      return err("MISSING_ENV", "Missing Supabase env vars", 500);
    }

    const key = serviceKey ?? anonKey!;
    const supabase = createClient(supabaseUrl, key, {
      global: { headers: { Authorization: `Bearer ${key}` } },
    });

    let body: Partial<InputPayload> = {};
    try {
      body = await req.json();
    } catch {
      return err("BAD_JSON", "Invalid JSON body", 400);
    }
    dlog(debug, "payload_raw", body);

    const mode = (body.service_type || "").toLowerCase() as ServiceType;
    if (mode !== "one-way" && mode !== "hourly") {
      return err("INVALID_SERVICE_TYPE", "Use 'one-way' or 'hourly'.");
    }

    // Direct hourly request from UI
    if (mode === "hourly") {
      return await buildHourlyResponse(supabase, body.hours, debug);
    }

    // ---- ONE-WAY PRICING PATH ----
    const pickupZip = normalizeZip(body.pickup_zip);
    const dropZip = normalizeZip(body.dropoff_zip);
    if (!pickupZip) return err("MISSING_FIELDS", "pickup_zip is required.");
    if (!dropZip) {
      return err("MISSING_DROPOFF_ZIP", "dropoff_zip is required for one-way.");
    }

    // Lookup zones for each zip
    const { data: pz, error: pErr } = await supabase
      .from("zones")
      .select("zip_code, dfw_zone, dal_zone")
      .eq("zip_code", pickupZip);
    const { data: dz, error: dErr } = await supabase
      .from("zones")
      .select("zip_code, dfw_zone, dal_zone")
      .eq("zip_code", dropZip);

    if (pErr || dErr) {
      return err(
        "DB_ERROR_ZONES",
        "Error looking up zones.",
        500,
        debug ? { pErr, dErr } : {},
      );
    }
    const pRow = pz?.[0];
    const dRow = dz?.[0];

    if (!pRow || !dRow) {
      return err("UNKNOWN_ZIP", "Invalid or unmapped ZIP code provided.", 400, {
        pickup_zip: pickupZip,
        dropoff_zip: dropZip,
        pickup_found: !!pRow,
        dropoff_found: !!dRow,
      });
    }

    const pDFW = Number(pRow.dfw_zone || 0);
    const pDAL = Number(pRow.dal_zone || 0);
    const dDFW = Number(dRow.dfw_zone || 0);
    const dDAL = Number(dRow.dal_zone || 0);

    // Airport hints
    const forcedDFW = body.airport_code === "DFW";
    const forcedDAL = body.airport_code === "DAL";
    const isDFWZip = pickupZip === DFW_ZIP || dropZip === DFW_ZIP;
    const isDALZip = pickupZip === DAL_ZIP || dropZip === DAL_ZIP;
    const isDFW = forcedDFW || isDFWZip;
    const isDAL = forcedDAL || isDALZip;

    // Choose a zone (cross-airport aware). We will NOT auto-fallback on >=5;
    // we'll *check pricing*, and only fallback if pricing rows are missing.
    let zoneUsed: number | null = null;
    let zoneFamily: "dfw" | "dal" | "mixed" | "generic" = "generic";

    if (isDFW && !isDAL) {
      zoneUsed = Math.max(pDFW, dDFW);
      zoneFamily = "dfw";
    } else if (isDAL && !isDFW) {
      zoneUsed = Math.max(pDAL, dDAL);
      zoneFamily = "dal";
    } else if (isDFW && isDAL) {
      // Cross-airport: DFW <-> DAL (no +1)
      const dfwSide = (pickupZip === DFW_ZIP)
        ? pDFW
        : (dropZip === DFW_ZIP ? dDFW : 0);
      const dalSide = (pickupZip === DAL_ZIP)
        ? pDAL
        : (dropZip === DAL_ZIP ? dDAL : 0);
      zoneUsed = Math.max(dfwSide, dalSide) || 0;
      zoneFamily = "mixed";
      if (zoneUsed <= 0) zoneUsed = null; // unmapped → hourly below
    } else {
      // Generic non-airport: highest across both families + 1
      const highest = Math.max(pDFW, pDAL, dDFW, dDAL, 0);
      zoneUsed = highest > 0 ? highest + 1 : null;
      zoneFamily = "generic";
    }

    dlog(debug, "zone_choice", {
      isDFW,
      isDAL,
      zoneFamily,
      pDFW,
      pDAL,
      dDFW,
      dDAL,
      zoneUsed,
    });

    // If we still don't have a usable zone number, go hourly
    if (!zoneUsed || !isFinite(zoneUsed) || zoneUsed < 1) {
      dlog(debug, "fallback_hourly_reason", "no_zone_computed");
      return await buildHourlyResponse(supabase, body.hours, debug);
    }

    // Try ONE-WAY pricing for that exact zone (even if it's 5+)
    const { data: priceRows, error: priceErr } = await supabase
      .from("pricing_grid")
      .select("vehicle_id, rate, is_active")
      .eq("service_type", "one-way")
      .eq("zone", zoneUsed)
      .eq("is_active", true);

    if (priceErr) {
      return err(
        "DB_ERROR_PRICING",
        "Error fetching one-way pricing.",
        500,
        debug ? { priceErr } : {},
      );
    }
    dlog(debug, "one_way_price_rows_count", priceRows?.length ?? 0);

    // If no one-way rows exist for this zone → hourly fallback
    if (!priceRows?.length) {
      dlog(debug, "fallback_hourly_reason", { no_pricing_for_zone: zoneUsed });
      return await buildHourlyResponse(supabase, body.hours, debug);
    }

    // Join with vehicle_types for details
    const ids = [...new Set(priceRows.map((r: any) => r.vehicle_id))];
    const { data: vt, error: vtErr } = await supabase
      .from("vehicle_types")
      .select(
        "vehicle_id, name, description, capacity, luggage_description, special_notes, is_active",
      )
      .in("vehicle_id", ids)
      .eq("is_active", true);

    if (vtErr) {
      return err(
        "DB_ERROR_VEHICLES",
        "Error fetching vehicle details.",
        500,
        debug ? { vtErr } : {},
      );
    }
    const vtMap = new Map<string, any>(
      (vt || []).map((v: any) => [v.vehicle_id, v]),
    );

    const vehicles = priceRows
      .filter((r: any) => vtMap.has(r.vehicle_id))
      .map((r: any) => {
        const v = vtMap.get(r.vehicle_id);
        const base = Number(r.rate);
        return {
          vehicle_id: r.vehicle_id,
          vehicle_type: v.name,
          vehicle_description: v.description,
          capacity: v.capacity,
          luggage_description: v.luggage_description,
          special_notes: v.special_notes,
          base_rate: base,
          total: base, // extras handled in frontend
        };
      });

    return json({
      service_type: "one-way",
      zone_used: zoneUsed,
      zone_family: zoneFamily,
      vehicles,
    });
  } catch (e) {
    console.log("[pricing-debug] unhandled", e);
    return err("UNHANDLED", String(e), 500);
  }
});
