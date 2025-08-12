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
import { createClient } from "@/utils/supabase/client";

// Types for pricing API response
interface PricingVehicle {
  vehicle_id: string;
  vehicle_type: string;
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
  vehicles: PricingVehicle[];
  extra_charges: Array<{ label: string; amount: number }>;
}

interface VehicleSelectionProps {
  selectedVehicle?: VehicleOption;
  onVehicleSelect: (vehicle: VehicleOption) => void;
  showPricing?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  // New props for pricing integration
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
  };
}

export default function VehicleSelection({
  selectedVehicle,
  onVehicleSelect,
  showPricing = true,
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,
  tripData,
}: VehicleSelectionProps) {
  const supabase = useMemo(() => createClient(), []);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const hasSetDefaultVehicle = useRef(false);

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

  // Fetch pricing data from backend
  useEffect(() => {
    const fetchPricing = async () => {
      if (!stableTripData || !showPricing) {
        return;
      }

      setPricingLoading(true);
      setPricingError(null);

      try {
        const payload: {
          service_type: "one-way" | "hourly";
          pickup_zip?: string;
          dropoff_zip?: string;
          hours?: number;
        } = {
          service_type:
            stableTripData.type === "by-the-hour" ? "hourly" : "one-way",
        };

        // For one-way trips, we need pickup and dropoff ZIP codes
        if (stableTripData.type === "one-way") {
          if (!stableTripData.fromZipcode || !stableTripData.toZipcode) {
            setPricingError("ZIP codes are required for pricing");
            return;
          }

          payload.pickup_zip = stableTripData.fromZipcode;
          payload.dropoff_zip = stableTripData.toZipcode;
        } else {
          // For hourly trips, we need pickup ZIP
          if (!stableTripData.fromZipcode) {
            setPricingError("Pickup ZIP code is required for pricing");
            return;
          }

          payload.pickup_zip = stableTripData.fromZipcode;

          // Extract hours from duration (e.g., "3 hours" -> 3)
          if (stableTripData.duration) {
            const hours = parseInt(
              stableTripData.duration.replace(/[^\d]/g, "")
            );
            if (hours > 0) {
              payload.hours = hours;
            }
          }
        }

        // Use direct fetch instead of Supabase client to ensure body is sent
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const response = await fetch(
          `${supabaseUrl}/functions/v1/get-pricing`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
              apikey: supabaseKey,
              "x-debug-pricing": "1",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        setPricing(data as PricingResponse);
      } catch (error) {
        console.error("Error fetching pricing:", error);
        setPricingError(
          "This area is not currently in our service zones. Please contact us for pricing information."
        );
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricing();
  }, [stableTripData, showPricing, supabase]);

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

  // Set default selection to first vehicle if no vehicle is selected (only once)
  useEffect(() => {
    if (
      !selectedVehicle &&
      vehiclesWithPricing.length > 0 &&
      !hasSetDefaultVehicle.current
    ) {
      hasSetDefaultVehicle.current = true;
      onVehicleSelect(vehiclesWithPricing[0]);
    }
  }, [selectedVehicle, onVehicleSelect, vehiclesWithPricing]);

  const formatPrice = (
    vehicle: VehicleOption & {
      pricingData?: PricingVehicle;
      hasPricing?: boolean;
    }
  ) => {
    if (pricingLoading) return "Loading...";

    // This function now only handles actual pricing display
    if (!vehicle.hasPricing || !vehicle.pricingData) {
      return ""; // Return empty since "Contact for pricing" is handled separately
    }

    const pricingData = vehicle.pricingData;

    if (tripData?.type === "by-the-hour" && pricingData.hourly_rate) {
      return (
        <div className="text-right">
          <div className="font-bold">{pricingData.total}</div>
          <div className="text-xs text-gray-500">
            {pricingData.hourly_rate}/hr × {pricingData.billable_hours}h
            {pricingData.min_hours &&
              pricingData.min_hours > (pricingData.hours_requested || 0) && (
                <div className="text-xs text-orange-600">
                  Min {pricingData.min_hours}h
                </div>
              )}
          </div>
        </div>
      );
    }

    return `${pricingData.total}`;
  };

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
        {vehiclesWithPricing.map((vehicle) => (
          <Card
            key={vehicle.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 relative ${
              selectedVehicle?.id === vehicle.id
                ? "ring-2 ring-amber-500 shadow-xl bg-amber-50"
                : "hover:shadow-md"
            }`}
            onClick={() => onVehicleSelect(vehicle)}
          >
            {/* Selection Badge - Outside the card content */}
            {selectedVehicle?.id === vehicle.id && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-10 border-2 border-white">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <CardContent className="p-3 sm:p-4">
              <div className="relative h-28 sm:h-32 overflow-hidden rounded-lg mb-3 bg-gray-100">
                <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                  {vehicle.name}
                </h4>

                {/* Vehicle Specs */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">{vehicle.passengers}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      <Luggage className="w-3 h-3" />
                      <span className="font-medium">{vehicle.bags}</span>
                    </span>
                  </div>

                  {/* Dynamic Pricing - Only show if vehicle has pricing */}
                  {showPricing &&
                    (() => {
                      const vehicleWithPricing = vehicle as VehicleOption & {
                        pricingData?: PricingVehicle;
                        hasPricing?: boolean;
                      };
                      return (
                        vehicleWithPricing.hasPricing &&
                        vehicleWithPricing.pricingData && (
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-bold">
                              {formatPrice(vehicleWithPricing)}
                            </span>
                          </div>
                        )
                      );
                    })()}
                </div>

                {/* Contact for Pricing - Only show if no pricing */}
                {showPricing &&
                  (() => {
                    const vehicleWithPricing = vehicle as VehicleOption & {
                      pricingData?: PricingVehicle;
                      hasPricing?: boolean;
                    };
                    return !vehicleWithPricing.hasPricing ||
                      !vehicleWithPricing.pricingData ? (
                      <div className="text-center">
                        <div className="text-xs text-amber-600 font-medium flex items-center justify-center gap-1">
                          <Phone className="w-3 h-3" />
                          Contact for pricing
                        </div>
                      </div>
                    ) : null;
                  })()}

                <div className="text-xs text-gray-600 leading-relaxed px-1">
                  {vehicle.description}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
          disabled={!canGoNext || !selectedVehicle}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
