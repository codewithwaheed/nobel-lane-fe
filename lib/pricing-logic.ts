// lib/pricing-logic.ts — FULL (early/late fee = $20)
// Centralized helpers for pricing breakdown + extras + formatting + tips

import { BookingFormData } from "./booking-storage";

/**
 * Extended booking data interface for pricing calculations
 */
export interface PricingBookingData extends Partial<BookingFormData> {
  isInternationalArrival?: boolean;
  isInternational?: boolean;
  isHoliday?: boolean;
  selectedVehicle?: BookingFormData["selectedVehicle"] & {
    pricingData?: PricingVehicle;
    hasPricing?: boolean;
  };
}

export type PricingVehicle = {
  vehicle_id: string;
  vehicle_type?: string;
  base_rate?: number;
  rate?: number;
  total: number; // one-way total OR computed hourly total
  hourly_rate?: number;
  min_hours?: number;
  billable_hours?: number;
  hours_requested?: number;
};

export type PricingBreakdownLegacy = {
  baseRate: number; // base fare or hourly total
  extrasRate: number; // additional services (stops, international, early/late, holiday)
  tollsRate: number; // tolls (e.g., DFW toll)
  gratuityRate: number; // tip component (usually UI 20%)
  totalPrice: number; // base + extras + tolls + gratuity
  breakdown: {
    serviceType: "one-way" | "by-the-hour";
    extraStopsCount?: number;
    // optional metadata for UI
    hourlyRate?: number;
    billableHours?: number;
    minHours?: number;
  };
};

// ------- Formatting helper (always show $; drop .00) -------
export const formatPrice = (n?: number | null) => {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const num = Number(n);
  return num % 1 === 0 ? `$${num}` : `$${num.toFixed(2)}`;
};

// ------- Constants for fee logic (keep in sync with DB/UI) -------
const DFW_ZIP = "75261"; // DFW Airport
// const DAL_ZIP = "75235"; // Dallas Love Field (not used for tolls per current spec)

const DFW_TOLL = 4.43; // applies if trip touches DFW airport
const EXTRA_STOP_FEE = 10; // per stop
const EARLY_LATE_FEE = 20; // pickups before 6:00 AM or after 10:00 PM
const INTERNATIONAL_ARRIVAL_FEE = 20;
const HOLIDAY_FEE = 10;

// ------- Fallback hourly catalog (used if backend didn't return hourly fields)
const FALLBACK_HOURLY: Record<string, { rate: number; min: number }> = {
  // vehicleId -> hourly rate & minimum hours
  sedan: { rate: 95, min: 2 },
  executive_sedan: { rate: 110, min: 2 },
  luxury_sedan: { rate: 150, min: 2 },
  suv: { rate: 110, min: 2 },
  executive_suv: { rate: 110, min: 2 },
  luxury_suv: { rate: 150, min: 2 },
  sprinter: { rate: 150, min: 3 },
  coach: { rate: 200, min: 5 },
};

// ---------- little helpers ----------
const touchesDFW = (bd: PricingBookingData) =>
  `${bd?.fromZipcode ?? ""}` === DFW_ZIP ||
  `${bd?.toZipcode ?? ""}` === DFW_ZIP;

const parseTimeToHours = (time: string): number | null => {
  // Accepts formats like "7:00 AM", "10:30 PM", "07:00", etc., treat as local Central clock
  if (!time) return null;
  const t = time.trim().toUpperCase();
  const ampm = t.endsWith("AM") || t.endsWith("PM") ? t.slice(-2) : "";
  const core = ampm ? t.slice(0, -2).trim() : t;
  const [hStr, mStr = "0"] = core.split(":");
  let h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  if (ampm === "AM") {
    if (h === 12) h = 0;
  } else if (ampm === "PM") {
    if (h !== 12) h += 12;
  }
  return h + m / 60;
};

// Parse hours from string like "4" or "4 hours" or "3h"
const parseRequestedHours = (dur?: string | number | null): number => {
  if (dur == null) return 0;
  const raw = typeof dur === "number" ? String(dur) : String(dur);
  const match = raw.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

// ---------- Public: extras calculator ----------
export const calculatePricingExtras = (bookingData: PricingBookingData) => {
  const out = {
    dfwToll: 0,
    extraStops: 0,
    earlyLatePickup: 0,
    internationalArrival: 0,
    holiday: 0,
  };

  if (touchesDFW(bookingData)) out.dfwToll = DFW_TOLL;

  const stops = Number(bookingData?.extraStopsCount ?? 0);
  if (stops > 0) out.extraStops = stops * EXTRA_STOP_FEE;

  const hrs = parseTimeToHours(String(bookingData?.time || ""));
  if (hrs != null && (hrs < 6 || hrs >= 22)) {
    out.earlyLatePickup = EARLY_LATE_FEE;
  }

  const isIntl = bookingData?.isInternationalArrival ??
    bookingData?.isInternational;
  if (isIntl) out.internationalArrival = INTERNATIONAL_ARRIVAL_FEE;

  if (bookingData?.isHoliday === true) out.holiday = HOLIDAY_FEE;

  return out;
};

// ---------- Public: base breakdown (reads selected vehicle pricing) ----------
export const calculatePricingBreakdown = (
  bookingData: PricingBookingData,
): PricingBreakdownLegacy => {
  const serviceType: "one-way" | "by-the-hour" =
    bookingData?.type === "by-the-hour" ? "by-the-hour" : "one-way";

  const selectedVehicle = bookingData?.selectedVehicle;
  const pricing: PricingVehicle | undefined = selectedVehicle?.pricingData;
  const vehicleId: string | undefined = selectedVehicle?.vehicleId;

  let base = 0;
  let hourlyRate: number | undefined;
  let billableHours: number | undefined;
  let minHours: number | undefined;

  if (serviceType === "by-the-hour") {
    // Prefer backend hourly fields when available
    hourlyRate = Number(pricing?.hourly_rate ?? 0);
    minHours = Number(pricing?.min_hours ?? NaN);

    // Fallback to catalog if backend didn't supply hourly
    if (!hourlyRate || Number.isNaN(hourlyRate) || hourlyRate <= 0) {
      const fb = vehicleId ? FALLBACK_HOURLY[vehicleId] : undefined;
      if (fb) {
        hourlyRate = fb.rate;
        if (!minHours || Number.isNaN(minHours) || minHours <= 0) {
          minHours = fb.min;
        }
      }
    }

    // Compute billable hours using bookingData.duration as requested hours when present
    const requested = parseRequestedHours(
      bookingData?.duration ?? pricing?.hours_requested,
    );
    const min = typeof minHours === "number" && minHours > 0 ? minHours : 2;
    billableHours = Math.max(requested, min);

    if (hourlyRate && billableHours) {
      base = Number((hourlyRate * billableHours).toFixed(2));
    }
  } else {
    // one-way: use backend one-way total/base first, fallback to static vehicle price
    const ow = Number(
      pricing?.total ?? pricing?.base_rate ?? pricing?.rate ??
        selectedVehicle?.price ?? 0,
    );
    base = Number(ow.toFixed(2));
  }

  return {
    baseRate: base,
    extrasRate: 0,
    tollsRate: 0,
    gratuityRate: 0,
    totalPrice: base,
    breakdown: {
      serviceType,
      extraStopsCount: Number(bookingData?.extraStopsCount ?? 0),
      hourlyRate,
      billableHours,
      minHours,
    },
  };
};

// ---------- Public: small smart tips for the summary ----------
export const getSmartRecommendations = (
  bookingData: PricingBookingData,
  selectedVehicle?: PricingBookingData["selectedVehicle"],
) => {
  const recs: string[] = [];
  const stops = Number(bookingData?.extraStopsCount ?? 0);
  if (stops > 0) {
    recs.push(
      `You added ${stops} extra stop${
        stops === 1 ? "" : "s"
      } ($${EXTRA_STOP_FEE}/stop).`,
    );
  }
  if (touchesDFW(bookingData)) {
    recs.push("DFW airport toll ($4.43) will be included.");
  }

  const hrs = parseTimeToHours(String(bookingData?.time || ""));
  if (hrs != null && (hrs < 6 || hrs >= 22)) {
    recs.push(
      "Pickup outside 6:00 AM–10:00 PM incurs an early/late fee ($20).",
    );
  }

  const isIntl = bookingData?.isInternationalArrival ??
    bookingData?.isInternational;
  if (isIntl) recs.push("International arrival processing adds $20.");
  if (bookingData?.isHoliday) recs.push("Holiday surcharge of $10 applies.");

  if (bookingData?.type === "by-the-hour") {
    const min = selectedVehicle?.pricingData?.min_hours ??
      FALLBACK_HOURLY[selectedVehicle?.vehicleId || ""]?.min ?? 2;
    recs.push(`Hourly bookings have a ${min}-hour minimum.`);
  }

  return recs;
};
