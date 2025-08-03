"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Luggage, DollarSign, Check } from "lucide-react";
import { VehicleOption, vehicleFleet } from "@/lib/booking-storage";

interface VehicleSelectionProps {
  selectedVehicle?: VehicleOption;
  onVehicleSelect: (vehicle: VehicleOption) => void;
  showPricing?: boolean;
}

export default function VehicleSelection({
  selectedVehicle,
  onVehicleSelect,
  showPricing = true,
}: VehicleSelectionProps) {
  const [hoveredVehicle, setHoveredVehicle] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Choose Your Vehicle
        </h2>
        <p className="text-gray-600 text-lg">
          Select the perfect vehicle for your journey
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicleFleet.map((vehicle) => (
          <Card
            key={vehicle.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedVehicle?.id === vehicle.id
                ? "ring-2 ring-amber-500 shadow-lg"
                : hoveredVehicle === vehicle.id
                ? "shadow-md transform -translate-y-1"
                : ""
            }`}
            onMouseEnter={() => setHoveredVehicle(vehicle.id)}
            onMouseLeave={() => setHoveredVehicle(null)}
            onClick={() => onVehicleSelect(vehicle)}
          >
            <CardContent className="p-0">
              {/* Vehicle Image */}
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
                {selectedVehicle?.id === vehicle.id && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Vehicle Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {vehicle.name}
                  </h3>
                  {showPricing && (
                    <div className="flex items-center text-amber-600 font-bold">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-lg">{vehicle.price}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {vehicle.description}
                </p>

                {/* Vehicle Specs */}
                <div className="flex gap-4 mb-4">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    {vehicle.passengers} passengers
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Luggage className="w-3 h-3" />
                    {vehicle.bags} bags
                  </Badge>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium">
                    INCLUDES:
                  </div>
                  <div className="text-xs text-gray-600">
                    • Professional chauffeur
                    <br />
                    • Complimentary water
                    <br />
                    • Phone chargers
                    <br />• Flight tracking
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Vehicle Summary */}
      {selectedVehicle && (
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Selected: {selectedVehicle.name}
              </h4>
              <p className="text-sm text-gray-600">
                Up to {selectedVehicle.passengers} passengers •{" "}
                {selectedVehicle.bags} bags
              </p>
            </div>
            {showPricing && (
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-600">
                  ${selectedVehicle.price}
                </div>
                <div className="text-xs text-gray-500">Base fare</div>
              </div>
            )}
          </div>
        </div>
      )}

      {!showPricing && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Pricing will be included in your personalized quote
          </p>
        </div>
      )}
    </div>
  );
}
