"use client";

import { useState } from "react";
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
} from "lucide-react";
import type { BookingFormData } from "@/lib/booking-storage";

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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
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

      if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Pickup Information
        </h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          {isQuote
            ? "Provide your contact details so we can send you a personalized quote"
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
                        onChange={(e) => handleChange("phone", e.target.value)}
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

                {/* Special Requests */}
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
            className="flex items-center justify-center gap-2 h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
          >
            {isQuote ? "Request Quote" : "Continue"}
            <ChevronRight className="h-4 w-4" />
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
            <div className="font-medium text-gray-900 mb-1">Special Needs?</div>
            <span className="text-gray-600">
              Child seats, wheelchair access, or extra stops available
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
