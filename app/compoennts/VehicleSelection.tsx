"use client";

import { useEffect } from "react";
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
} from "lucide-react";
import { VehicleOption, vehicleFleet } from "@/lib/booking-storage";

interface VehicleSelectionProps {
  selectedVehicle?: VehicleOption;
  onVehicleSelect: (vehicle: VehicleOption) => void;
  showPricing?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

export default function VehicleSelection({
  selectedVehicle,
  onVehicleSelect,
  showPricing = true,
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,
}: VehicleSelectionProps) {
  // Set default selection to first vehicle if no vehicle is selected
  useEffect(() => {
    if (!selectedVehicle && vehicleFleet.length > 0) {
      onVehicleSelect(vehicleFleet[0]);
    }
  }, [selectedVehicle, onVehicleSelect]);

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
      </div>

      {/* All Vehicles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {vehicleFleet.map((vehicle) => (
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

            <CardContent className="p-4 sm:p-5">
              <div className="relative h-32 sm:h-36 overflow-hidden rounded-lg mb-4 bg-gray-100">
                <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                  {vehicle.name}
                </h4>

                {/* Vehicle Specs */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">{vehicle.passengers}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      <Luggage className="w-3 h-3" />
                      <span className="font-medium">{vehicle.bags}</span>
                    </span>
                  </div>
                </div>

                {/* Pricing - More Prominent */}
                {showPricing && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-lg text-center shadow-md">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-lg font-bold">{vehicle.price}</span>
                    </div>
                    <div className="text-xs opacity-90 mt-1">Starting from</div>
                  </div>
                )}

                {/* Features */}
                <div className="bg-gray-50 p-2 rounded-md">
                  <div className="text-xs text-gray-600 text-center font-medium">
                    ✓ Professional Driver • ✓ Water • ✓ Chargers
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center justify-center gap-2 h-12 text-sm sm:text-base font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Step
        </Button>

        <Button
          onClick={onNext}
          disabled={!canGoNext || !selectedVehicle}
          className="flex items-center justify-center gap-2 h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
