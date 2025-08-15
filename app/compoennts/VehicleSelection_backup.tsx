"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Luggage,
  DollarSign,
  Check,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";
import { VehicleOption, vehicleFleet } from "@/lib/booking-storage";

/* =========================
   Types for pricing API
   ========================= */
interface PricingVehicle {
  vehicle_id: string;
  vehicle_type?: string;
  base_rate?: number;
  rate?: number;
  total: number;
  hourly_rate?: number;
  min_hours?: number;
  billable_hours?: number;
  hours_requested?: number;
}

interface PricingResponse {
  service_type: "one-way" | "hourly";
  zone_used?: number;
  zone_type?: "dfw" | "dal";
  vehicles: PricingVehicle[];
  // optional — some backends won't send this
  extra_charges?: Array<{ label: string; amount: number }>;
}

interface VehicleSelectionProps {
  selectedVehicle?: VehicleOption;
  onVehicleSelect: (vehicle: VehicleOption) => void;
  showPricing?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  // NEW: let the wizard know when pricing is loading / exists
  onPricingStatus?: (s: { loading: boolean; hasAnyPricing: boolean }) => void;
  // Add flag to indicate if we're in quote flow (to hide pricing display)
  isQuoteFlow?: boolean;

  // pricing inputs
  tripData?: {
    type: "one-way" | "by-the-hour";
    fromPlaceId?: string;
    toPlaceId?: string;
    fromLat?: number;
    fromLng?: number;
    toLat?: number;
    toLng?: number;
    fromZipcode?: string;
    toZipcode?: string;
    duration?: string;

    // Optional flags (safe to include even if backend ignores for now)
    airport_code?: "DFW" | "DAL";
    isEarlyOrLate?: boolean;
    isInternational?: boolean;
    isHoliday?: boolean;
    needsFlightTracking?: boolean;
    extraStops?: number;
  };
}

export default function VehicleSelection({
  selectedVehicle,
  onVehicleSelect,
  showPricing = true,
  onNext,
  onPrevious,
  canGoNext: _canGoNext = true, // eslint-disable-line @typescript-eslint/no-unused-vars
  canGoPrevious = true,
  onPricingStatus,
  isQuoteFlow = false,
  tripData,
}: VehicleSelectionProps) {
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const hasSetDefaultVehicle = useRef(false);

  type VehicleWithPricing = VehicleOption & {
    pricingData?: PricingVehicle;
    hasPricing?: boolean;
  };

  // Create stable reference for trip data to prevent unnecessary API calls
  const stableTripData = useMemo(() => {
    if (!tripData) return null;
    return {
      type: tripData.type,
      fromZipcode: tripData.fromZipcode,
      toZipcode: tripData.toZipcode,
      duration: tripData.duration,
    };
  }, [tripData]);

  // Deduplicated fetch with AbortController to prevent repeated calls
  const lastPayloadRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // use primitive deps to avoid object identity reruns
    const from = stableTripData?.fromZipcode ?? null;
    const to = stableTripData?.toZipcode ?? null;
    const type = stableTripData?.type ?? null;
    const duration = stableTripData?.duration ?? null;
    const airport = tripData?.airport_code ?? null;

    if (!from) {
      onPricingStatus?.({ loading: false, hasAnyPricing: false });
      return;
    }

    const fetchPricing = async () => {
      setPricingError(null);

      const payload: {
        service_type: "one-way" | "hourly";
        pickup_zip?: string;
        dropoff_zip?: string;
        hours?: number;
        airport_code?: "DFW" | "DAL";
        extra_stops?: number;
        is_early_or_late?: boolean;
        is_international_arrival?: boolean;
        is_holiday?: boolean;
        needs_flight_tracking?: boolean;
      } = {
        service_type: type === "by-the-hour" ? "hourly" : "one-way",
        pickup_zip: from,
      };

      if (payload.service_type === "one-way") {
        if (!to) {
          setPricingError("ZIP codes are required for pricing");
          onPricingStatus?.({ loading: false, hasAnyPricing: false });
          return;
        }
        payload.dropoff_zip = to;
        if (airport === "DFW" || airport === "DAL")
          payload.airport_code = airport;
      } else {
        if (duration) {
          const hours = parseInt(duration.replace(/[^\d]/g, ""));
          if (hours > 0) payload.hours = hours;
        }
      }

      payload.is_early_or_late = !!tripData?.isEarlyOrLate;
      payload.is_international_arrival = !!tripData?.isInternational;
      payload.is_holiday = !!tripData?.isHoliday;
      payload.needs_flight_tracking = !!tripData?.needsFlightTracking;
      payload.extra_stops = Number(tripData?.extraStops ?? 0);

      const payloadStr = JSON.stringify(payload);
      // skip identical payload
      if (lastPayloadRef.current === payloadStr) return;

      // cancel previous
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      lastPayloadRef.current = payloadStr;
      setPricingLoading(true);
      onPricingStatus?.({ loading: true, hasAnyPricing: false });

      try {
        const { getCleanSupabaseUrl, getSupabaseAnonKey } = await import(
          "@/lib/supabase-env"
        );
        const supabaseUrl = getCleanSupabaseUrl();
        const supabaseKey = getSupabaseAnonKey();

        if (!supabaseUrl || !supabaseKey) {
          setPricingError("Supabase environment variables are missing.");
          onPricingStatus?.({ loading: false, hasAnyPricing: false });
          setPricingLoading(false);
          return;
        }

        const res = await fetch(`${supabaseUrl}/functions/v1/get-pricing`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
            "x-debug-pricing": "1",
          },
          body: payloadStr,
          signal: controller.signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }

        const data = (await res.json()) as PricingResponse;
        setPricing(data);
        const hasAnyPricing =
          Array.isArray(data.vehicles) && data.vehicles.length > 0;
        onPricingStatus?.({ loading: false, hasAnyPricing });
      } catch (e: unknown) {
        const err = e as { name?: string; message?: string };
        if (err?.name === "AbortError") return; // cancelled
        console.error("Error fetching pricing:", err?.message ?? e);
        setPricingError(
          "This area is not currently in our service zones. Please contact us for pricing information."
        );
        onPricingStatus?.({ loading: false, hasAnyPricing: false });
      } finally {
        setPricingLoading(false);
        abortRef.current = null;
      }
    };

    fetchPricing();

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [
    stableTripData?.fromZipcode,
    stableTripData?.toZipcode,
    stableTripData?.type,
    stableTripData?.duration,
    tripData?.airport_code,
    tripData?.isEarlyOrLate,
    tripData?.isInternational,
    tripData?.isHoliday,
    tripData?.needsFlightTracking,
    tripData?.extraStops,
    onPricingStatus,
  ]); // Removed showPricing - always fetch, only display conditionally

  // Map static vehicles with dynamic pricing
  const vehiclesWithPricing = useMemo(() => {
    return vehicleFleet.map((vehicle) => {
      // Find the best pricing data for this vehicle (lowest price)
      const matchingPricing = pricing?.vehicles.filter(
        (p) => p.vehicle_id === vehicle.vehicleId
      );

      // Get the lowest priced option for this vehicle type
      const pricingData =
        matchingPricing && matchingPricing.length > 0
          ? matchingPricing.reduce((best, current) => {
              return current.total < best.total ? current : best;
            })
          : undefined;

      return {
        ...vehicle,
        pricingData,
        hasPricing: !!pricingData,
      };
    });
  }, [pricing]);

  // Ensure wizard-selected vehicle stays in sync with current pricing result
  useEffect(() => {
    if (!selectedVehicle) return;
    const current = vehiclesWithPricing.find(
      (v) => v.id === selectedVehicle.id
    ) as VehicleWithPricing | undefined;
    if (!current) return;
    // if selected has no pricing now, push the updated (no pricing) version
    const selectedWithPricing =
      selectedVehicle as unknown as VehicleWithPricing;
    if (!current.hasPricing || !current.pricingData) {
      onVehicleSelect(current);
    } else if (
      current.pricingData &&
      selectedWithPricing.pricingData?.total !== current.pricingData.total
    ) {
      onVehicleSelect(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiclesWithPricing]);

  // Set default selection to first priced vehicle; fallback to first (only once per mount)
  useEffect(() => {
    if (
      !selectedVehicle &&
      vehiclesWithPricing.length > 0 &&
      !hasSetDefaultVehicle.current
    ) {
      hasSetDefaultVehicle.current = true;

      // Prefer first with pricing; fallback to first vehicle
      const firstPriced =
        (vehiclesWithPricing.find(
          (v) => (v as VehicleWithPricing).hasPricing
        ) as VehicleWithPricing) ??
        (vehiclesWithPricing[0] as VehicleWithPricing);

      onVehicleSelect(firstPriced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle, vehiclesWithPricing]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Choose Your Service
        </h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Select the perfect vehicle for your journey. Each service includes
          professional chauffeur, complimentary amenities, and premium comfort.
        </p>

        {/* Pricing Note */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm max-w-2xl mx-auto">
          <p className="text-center">
            <span className="font-medium">*</span> Pricing based on ZIP code.
            Final pricing includes gratuity, tolls, and any additional services
          </p>
        </div>

        {pricingError && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
            <p className="font-medium mb-1">Pricing Information</p>
            <p>{pricingError}</p>
            <p className="mt-2 text-xs">
              Please contact us directly for pricing in this area.
            </p>
          </div>
        )}
      </div>

      {/* All Vehicles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {vehiclesWithPricing.map((vehicle) => {
          const v = vehicle as VehicleOption & {
            pricingData?: PricingVehicle;
            hasPricing?: boolean;
          };
          const p = v.pricingData;

          // treat as hourly if backend fell back OR user chose by-the-hour
          const isHourly =
            pricing?.service_type === "hourly" ||
            tripData?.type === "by-the-hour";

          // Show pricing only if not in quote flow AND pricing exists
          const shouldShowPricing =
            showPricing && !isQuoteFlow && v.hasPricing && p;

          return (
            <Card
              key={v.id}
              role="button"
              tabIndex={0}
              aria-pressed={selectedVehicle?.id === v.id}
              className={`cursor-pointer group transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                selectedVehicle?.id === v.id
                  ? "ring-2 ring-amber-500 shadow-xl bg-amber-50"
                  : "hover:shadow-lg hover:scale-[1.02]"
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onVehicleSelect(v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onVehicleSelect(v);
                }
              }}
            >
              {/* Selection Badge */}
              {selectedVehicle?.id === v.id && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-10 border-2 border-white">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <CardContent className="p-3 sm:p-4">
                <div className="relative h-28 sm:h-32 overflow-hidden rounded-lg mb-3 bg-gray-100">
                  <Image
                    src={v.image}
                    alt={v.name}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-2">
                  {/* Title + Price */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                      {v.name}
                    </h4>

                    {/* Price block - only show if should show pricing */}
                    {shouldShowPricing && (
                      <div className="flex flex-col items-end shrink-0">
                        <div className="inline-flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 font-extrabold text-sm">
                            {(() => {
                              const n = Number(p.total);
                              if (Number.isNaN(n)) return "—";
                              return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
                            })()}
                          </span>
                        </div>

                        {/* Hourly subline (only when hourly) */}
                        {isHourly && p.hourly_rate && (
                          <div className="text-[11px] leading-tight text-gray-500 mt-0.5 text-right">
                            {(() => {
                              const fmt = (x?: number) =>
                                x == null || Number.isNaN(Number(x))
                                  ? "—"
                                  : Number(x) % 1 === 0
                                  ? `$${Number(x)}`
                                  : `$${Number(x).toFixed(2)}`;
                              return (
                                <>
                                  {fmt(p.hourly_rate)}/hr × {p.billable_hours}h
                                  {p.min_hours &&
                                    p.min_hours > (p.hours_requested || 0) && (
                                      <span className="ml-1 text-amber-600">
                                        (min {p.min_hours}h)
                                      </span>
                                    )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Specs row */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        <Users className="w-3 h-3" />
                        <span className="font-medium">{v.passengers}</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        <Luggage className="w-3 h-3" />
                        <span className="font-medium">{v.bags}</span>
                      </span>
                    </div>
                  </div>

                  {/* Contact for pricing if no price, not during loading, and not in quote flow */}
                  {showPricing &&
                    !pricingLoading &&
                    !isQuoteFlow &&
                    (!v.hasPricing || !p) && (
                      <div className="mt-3 text-xs text-amber-600 font-medium flex items-center justify-center gap-1">
                        <Phone className="w-3 h-3" />
                        Contact for pricing
                      </div>
                    )}

                  {/* Description */}
                  <div className="text-xs text-gray-600 leading-relaxed px-1">
                    {v.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Loading State */}
      {pricingLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
            Loading pricing information...
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedVehicle || pricingLoading}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
