"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, MessageSquare, Phone } from "lucide-react";
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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {isQuote ? "Contact Information" : "Additional Details"}
        </h2>
        <p className="text-gray-600 text-lg">
          {isQuote
            ? "How should we reach you with your quote?"
            : "Help us provide the best service for your trip"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isQuote ? (
          // Quote Flow - Contact Information
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {errors.contact && (
                    <p className="text-sm text-red-500">{errors.contact}</p>
                  )}

                  <p className="text-xs text-gray-500">
                    We&apos;ll use this information to send your quote and
                    coordinate your booking.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Special Requests
                  </h3>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements, requests, or additional information..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Let us know about child seats, accessibility needs, multiple
                    stops, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          // Booking Flow - Flight Info and Notes
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Flight Information
                  </h3>
                </div>

                <div>
                  <Label htmlFor="flightNumber">Flight Number (Optional)</Label>
                  <Input
                    id="flightNumber"
                    type="text"
                    placeholder="e.g., AA1234, DL567"
                    value={formData.flightNumber}
                    onChange={(e) =>
                      handleChange("flightNumber", e.target.value)
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We&apos;ll track your flight for delays and adjust pickup
                    time accordingly.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Special Requests
                  </h3>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements, requests, or additional information..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Let us know about child seats, accessibility needs, multiple
                    stops, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isQuote ? "Request Quote" : "Continue to Payment"}
          </Button>
        </div>
      </form>

      {/* Benefits */}
      <div className="mt-8 grid md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
          <span>Professional, uniformed chauffeurs</span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
          <span>Real-time flight tracking</span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
          <span>Complimentary waiting time</span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
          <span>24/7 customer support</span>
        </div>
      </div>
    </div>
  );
}
