"use client";

import { useState } from "react";
import {
  calculatePricingBreakdown,
  getSmartRecommendations,
} from "@/lib/pricing-logic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plane,
  MessageSquare,
  Phone,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import type { BookingFormData } from "@/lib/booking-storage";
import { clearBookingData } from "@/lib/booking-storage";
import { createClient } from "@/utils/supabase/client";
import {
  validateUSPhoneNumber,
  formatPhoneInput,
} from "@/lib/phone-validation";

interface AdditionalInfoProps {
  isQuote: boolean;
  bookingData: BookingFormData;
  onSubmit: (data: Partial<BookingFormData>) => void;
  onBack: () => void;
}

export default function AdditionalInfo({
  isQuote,
  bookingData,
  onSubmit,
  onBack,
}: AdditionalInfoProps) {
  const [formData, setFormData] = useState({
    flightNumber: bookingData.flightNumber || "",
    notes: bookingData.notes || "",
    phone: bookingData.phone || "",
    email: bookingData.email || "",
    extraStopsRequired: bookingData.extraStopsRequired || false,
    extraStopsCount: bookingData.extraStopsCount || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  const handlePhoneChange = (value: string) => {
    // Format the phone number as user types
    const formatted = formatPhoneInput(value);
    setFormData((prev) => ({ ...prev, phone: formatted }));

    // Clear error when user starts typing
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isQuote) {
      // For quotes, require contact information
      if (!formData.phone && !formData.email) {
        newErrors.contact =
          "Please provide either a phone number or email address";
      }

      if (formData.phone) {
        const phoneValidation = validateUSPhoneNumber(formData.phone);
        if (!phoneValidation.isValid) {
          newErrors.phone = "Please enter a valid phone number";
        } else if (!phoneValidation.isUSCanada) {
          newErrors.phone =
            "Please enter a US phone number for SMS notifications";
        }
      }

      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createQuote = async (quoteData: Partial<BookingFormData>) => {
    try {
      setIsCreatingQuote(true);

      // Get Supabase client for authentication
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Calculate pricing breakdown using the existing bookingData structure
      const pricingDetails = calculatePricingBreakdown(bookingData);

      // Get smart recommendations
      const recommendations = getSmartRecommendations(bookingData);

      const payload = {
        // Quote type and source
        quoteType: "get-quote",
        quoteSource: "website",

        // Customer information - map from form fields
        customerEmail: quoteData.email || formData.email,
        customerPhone: quoteData.phone || formData.phone,

        // Trip details - from booking data
        from: bookingData.from,
        to: bookingData.to,
        date: bookingData.date,
        time: bookingData.time,
        passengers: bookingData.passengers,
        tripType: bookingData.type,
        duration: bookingData.duration,

        // Location details
        fromZipcode: bookingData.fromZipcode,
        toZipcode: bookingData.toZipcode,
        fromCity: bookingData.fromCity,
        toCity: bookingData.toCity,
        fromState: bookingData.fromState,
        toState: bookingData.toState,
        fromPlaceId: bookingData.fromPlaceId,
        toPlaceId: bookingData.toPlaceId,
        fromLat: bookingData.fromLat,
        fromLng: bookingData.fromLng,
        toLat: bookingData.toLat,
        toLng: bookingData.toLng,

        // Vehicle selection
        selectedVehicle: bookingData.selectedVehicle,

        // Pricing breakdown (convert to expected backend structure)
        pricingBreakdown: pricingDetails
          ? {
              baseRate: pricingDetails.baseRate || 0,
              tolls: pricingDetails.tollsRate || 0,
              extras: pricingDetails.extrasRate || 0,
              subtotal:
                (pricingDetails.baseRate || 0) +
                (pricingDetails.tollsRate || 0) +
                (pricingDetails.extrasRate || 0),
              gratuity: pricingDetails.gratuityRate || 0,
              totalCalculated: pricingDetails.totalPrice || 0,
              extrasBreakdown: {},
            }
          : undefined,
        recommendations,

        // Metadata
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-quote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            }`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create quote");
      }

      await response.json();

      // Clear booking data and navigate to success
      clearBookingData();
      onSubmit(formData);
    } catch (error) {
      console.error("Error creating quote:", error);
      setErrors({
        submit: "Failed to submit quote request. Please try again.",
      });
    } finally {
      setIsCreatingQuote(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      if (isQuote) {
        createQuote(formData);
      } else {
        onSubmit(formData);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          {isQuote ? "Get a Quote" : "Pickup Information"}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          {isQuote
            ? "Provide your contact details and we'll send you a personalized quote within minutes"
            : "Help us provide the best service for your journey with additional details"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isQuote ? (
              // Quote Flow - Contact Information
              <>
                {/* Contact Information */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                    <Phone className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Contact Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700 mb-1.5 block"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`h-12 ${
                          errors.phone
                            ? "border-red-500 focus:border-red-500"
                            : "focus:border-amber-500"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700 mb-1.5 block"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={`h-12 ${
                          errors.email
                            ? "border-red-500 focus:border-red-500"
                            : "focus:border-amber-500"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {errors.contact && (
                    <p className="text-sm text-red-500 mt-2">
                      {errors.contact}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    We&apos;ll use this information to send your quote and
                    coordinate your booking.
                  </p>
                </div>

                {/* Extra Stops - Hidden for quotes */}
                {!isQuote && (
                  <div className="lg:col-span-2 border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Extra Stops
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="extraStopsRequired"
                          checked={formData.extraStopsRequired}
                          onChange={(e) =>
                            handleChange("extraStopsRequired", e.target.checked)
                          }
                          className="w-4 h-4 text-amber-500 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                        />
                        <Label
                          htmlFor="extraStopsRequired"
                          className="text-sm font-medium text-gray-700"
                        >
                          Extra stops required
                        </Label>
                      </div>

                      {formData.extraStopsRequired && (
                        <div className="ml-7 space-y-2">
                          <Label
                            htmlFor="extraStopsCount"
                            className="text-sm font-medium text-gray-700 block"
                          >
                            Number of extra stops
                          </Label>
                          <select
                            id="extraStopsCount"
                            value={formData.extraStopsCount}
                            onChange={(e) =>
                              handleChange(
                                "extraStopsCount",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-32 h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          >
                            {[1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500">
                            Each extra stop adds $10 to your total cost
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Requests - Hidden for quotes */}
                {!isQuote && (
                  <div className="lg:col-span-2 border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Special Requests
                      </h3>
                    </div>

                    <div>
                      <Label
                        htmlFor="notes"
                        className="text-sm font-medium text-gray-700 mb-1.5 block"
                      >
                        Additional Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special requirements, requests, or additional information..."
                        value={formData.notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleChange("notes", e.target.value)
                        }
                        rows={4}
                        className="focus:border-amber-500 resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Let us know about child seats, accessibility needs,
                        multiple stops, etc.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Booking Flow - Flight Info and Notes
              <>
                {/* Flight Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Plane className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Flight Information
                    </h3>
                  </div>

                  <div>
                    <Label
                      htmlFor="flightNumber"
                      className="text-sm font-medium text-gray-700 mb-1.5 block"
                    >
                      Flight Number (Optional)
                    </Label>
                    <Input
                      id="flightNumber"
                      type="text"
                      placeholder="e.g., AA1234, DL567"
                      value={formData.flightNumber}
                      onChange={(e) =>
                        handleChange("flightNumber", e.target.value)
                      }
                      className="h-12 focus:border-amber-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We&apos;ll track your flight for delays and adjust pickup
                      time accordingly.
                    </p>
                  </div>
                </div>

                {/* Extra Stops */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Extra Stops
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="extraStopsRequired"
                        checked={formData.extraStopsRequired}
                        onChange={(e) =>
                          handleChange("extraStopsRequired", e.target.checked)
                        }
                        className="w-4 h-4 text-amber-500 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                      />
                      <Label
                        htmlFor="extraStopsRequired"
                        className="text-sm font-medium text-gray-700"
                      >
                        Extra stops required
                      </Label>
                    </div>

                    {formData.extraStopsRequired && (
                      <div className="ml-7 space-y-2">
                        <Label
                          htmlFor="extraStopsCount"
                          className="text-sm font-medium text-gray-700 block"
                        >
                          Number of extra stops
                        </Label>
                        <select
                          id="extraStopsCount"
                          value={formData.extraStopsCount}
                          onChange={(e) =>
                            handleChange(
                              "extraStopsCount",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-32 h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500">
                          Each extra stop adds $10 to your total cost
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Special Requests
                    </h3>
                  </div>

                  <div>
                    <Label
                      htmlFor="notes"
                      className="text-sm font-medium text-gray-700 mb-1.5 block"
                    >
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements, requests, or additional information..."
                      value={formData.notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleChange("notes", e.target.value)
                      }
                      rows={4}
                      className="focus:border-amber-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Let us know about child seats, accessibility needs,
                      multiple stops, etc.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quote Submission Error */}
        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons - Consistent with VehicleSelection */}
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex items-center justify-center gap-2 h-12 text-sm sm:text-base font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Step
          </Button>

          <Button
            type="submit"
            disabled={isCreatingQuote}
            className="flex items-center justify-center gap-2 h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingQuote ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Quote...
              </>
            ) : (
              <>
                {isQuote ? "Request Quote" : "Continue"}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Information Cards - Relevant to Pickup */}
      <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <div className="font-medium text-gray-900 mb-1">
              Flight Changes?
            </div>
            <span className="text-gray-600">
              We automatically adjust for delays and early arrivals
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <div className="font-medium text-gray-900 mb-1">Extra Stops</div>
            <span className="text-gray-600">
              Need multiple stops? Add up to 5 extra stops for just $10 each
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <div className="font-medium text-gray-900 mb-1">
              Contact Updates
            </div>
            <span className="text-gray-600">
              SMS and email confirmations with driver details
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
