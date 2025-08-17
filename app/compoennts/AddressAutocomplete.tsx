"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type PlaceDetails = {
  formatted_address: string;
  place_id: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components?: AddressComponent[];
  zipcode?: string;
  city?: string;
  state?: string;
  country?: string;
};

type ValidationState = "loading" | "valid" | "invalid" | null;

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

export default function AddressAutocomplete({
  id,
  value,
  placeholder,
  onChange,
  onSelect,
  error,
  className,
  label,
  showValidation = true,
}: {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSelect: (details: PlaceDetails) => void;
  error?: string;
  className?: string;
  label?: string;
  showValidation?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>(null);
  const [showZipFallback, setShowZipFallback] = useState(false);
  const [manualZip, setManualZip] = useState("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract address components to get zipcode and other details
  const extractAddressComponents = (
    addressComponents: AddressComponent[]
  ): Partial<PlaceDetails> => {
    const result: Partial<PlaceDetails> = {};

    for (const component of addressComponents) {
      if (component.types.includes("postal_code")) {
        result.zipcode = component.long_name;
      } else if (component.types.includes("locality")) {
        result.city = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        result.state = component.short_name;
      } else if (component.types.includes("country")) {
        result.country = component.long_name;
      }
    }

    return result;
  };

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) {
      return;
    }

    // Poll for Google Maps to be loaded
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!isGoogleMapsLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    console.log("Initializing Google Places Autocomplete");

    try {
      // Create autocomplete instance with mixed types for better results
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country: "us" },
          fields: [
            "place_id",
            "formatted_address",
            "geometry",
            "address_components",
          ],
          // Use establishment + geocode (not address) for more specific results
          types: ["establishment", "geocode"],
        }
      );

      // Add place changed listener
      autocompleteRef.current.addListener("place_changed", async () => {
        const place = autocompleteRef.current?.getPlace();
        console.log("Google Places result:", place);

        if (place && place.place_id && place.formatted_address) {
          setValidationState("valid");
          // Update input value immediately
          onChange(place.formatted_address);

          // Extract address components directly from the autocomplete result
          let addressComponents = {};
          if (place.address_components) {
            addressComponents = extractAddressComponents(
              place.address_components
            );
          }

          const placeDetails: PlaceDetails = {
            formatted_address: place.formatted_address,
            place_id: place.place_id,
            geometry: place.geometry
              ? {
                  location: {
                    lat: place.geometry.location?.lat() || 0,
                    lng: place.geometry.location?.lng() || 0,
                  },
                }
              : undefined,
            address_components: place.address_components,
            ...addressComponents,
          };

          // If no zipcode found, show fallback
          if (!placeDetails.zipcode) {
            setShowZipFallback(true);
          } else {
            setShowZipFallback(false);
          }

          onSelect(placeDetails);
        } else {
          setValidationState("invalid");
        }
      });
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error);
    }
  }, [isGoogleMapsLoaded, onSelect, onChange]);

  // Handle input changes with debouncing and validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Reset validation and fallback states
    setShowZipFallback(false);

    if (!newValue.trim() || newValue.length < 3) {
      setValidationState(null);
      return;
    }

    setValidationState("loading");

    // Debounce validation check
    debounceTimeoutRef.current = setTimeout(() => {
      // Basic validation - this will be overridden by actual place selection
      if (newValue.length > 5) {
        setValidationState("valid");
      }
    }, 300);
  };

  // Handle manual ZIP code entry
  const handleManualZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const zip = e.target.value.replace(/\D/g, "").slice(0, 5); // Only digits, max 5
    setManualZip(zip);

    if (zip.length === 5) {
      // Create a place details object with the manual ZIP
      const placeDetails: PlaceDetails = {
        formatted_address: value,
        place_id: `manual_${zip}`,
        zipcode: zip,
      };

      console.log("Manual ZIP entered:", placeDetails);
      onSelect(placeDetails);
      setValidationState("valid");
      setShowZipFallback(false);
    }
  };

  // Render validation icon
  const renderValidationIcon = () => {
    if (!showValidation || !value) return null;

    switch (validationState) {
      case "loading":
        return (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        );
      case "valid":
        return (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
        );
      case "invalid":
        return (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
        );
      default:
        return null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  return (
    <div className={`relative ${className || ""}`}>
      {label && (
        <div className="flex items-center mb-2">
          <MapPin className="w-4 h-4 mr-1 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={handleInputChange}
          className={`pr-10 ${error ? "border-red-500" : ""} ${
            validationState === "invalid"
              ? "border-red-500 focus:border-red-500"
              : ""
          } ${
            validationState === "valid"
              ? "border-green-500 focus:border-green-500"
              : ""
          }`}
        />
        {renderValidationIcon()}
      </div>

      {/* Manual ZIP code fallback */}
      {showZipFallback && (
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md relative z-10">
          <p className="text-sm text-amber-800 mb-2">
            Please enter ZIP code for accurate pricing:
          </p>
          <Input
            type="text"
            placeholder="Enter ZIP code (5 digits)"
            value={manualZip}
            onChange={handleManualZipChange}
            maxLength={5}
            className="w-full text-sm relative z-10"
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Custom styling for Google's autocomplete dropdown */}
      <style jsx global>{`
        .pac-container {
          border-radius: 8px !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          background-color: white !important;
          font-family: "Poppins", system-ui, -apple-system, sans-serif !important;
        }

        .pac-item {
          border-bottom: 1px solid #f3f4f6 !important;
          padding: 12px 16px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
        }

        .pac-item:hover {
          background-color: #f9fafb !important;
        }

        .pac-item-selected {
          background-color: #fef3c7 !important;
        }

        .pac-item-query {
          font-weight: 600 !important;
          color: #111827 !important;
        }

        .pac-matched {
          font-weight: 700 !important;
          color: #d97706 !important;
        }

        .pac-item:last-child {
          border-bottom: none !important;
        }

        .pac-logo:after {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
