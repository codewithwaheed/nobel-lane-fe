"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { getBookingData, type BookingFormData } from "@/lib/booking-storage";

function BookNowContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // "quote" or "book-now"
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Only access localStorage after component is mounted on client
      const data = getBookingData();
      setFormData(data);
      setLoading(false);
    }
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              No Booking Data Found
            </CardTitle>
            <CardDescription className="text-center">
              Please fill out the booking form first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.history.back()}
              className="w-full"
              variant="outline"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isQuote = type === "quote";
  const pageTitle = isQuote ? "Get Your Quote" : "Complete Your Booking";
  const pageDescription = isQuote
    ? "Review your trip details and we'll provide you with a competitive quote."
    : "Confirm your trip details and complete your luxury transportation booking.";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant={isQuote ? "secondary" : "default"} className="mb-4">
            {isQuote ? "Quote Request" : "Booking Confirmation"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {pageTitle}
          </h1>
          <p className="text-gray-600 md:text-lg">{pageDescription}</p>
        </div>

        {/* Trip Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Trip Type */}
            <div className="flex items-center justify-between py-2 border-b">
              <span className="font-medium text-gray-700">Trip Type</span>
              <Badge variant="outline">
                {formData.type === "one-way" ? "One Way" : "By the Hour"}
              </Badge>
            </div>

            {/* From */}
            <div className="flex items-start gap-3 py-2 border-b">
              <MapPinIcon className="h-4 w-4 mt-1 text-green-600" />
              <div>
                <span className="font-medium text-gray-700">From</span>
                <p className="text-gray-900">{formData.from}</p>
              </div>
            </div>

            {/* To (for one-way trips) */}
            {formData.type === "one-way" && formData.to && (
              <div className="flex items-start gap-3 py-2 border-b">
                <MapPinIcon className="h-4 w-4 mt-1 text-red-600" />
                <div>
                  <span className="font-medium text-gray-700">To</span>
                  <p className="text-gray-900">{formData.to}</p>
                </div>
              </div>
            )}

            {/* Duration (for hourly trips) */}
            {formData.type === "by-the-hour" && formData.duration && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium text-gray-700">Duration</span>
                <span className="text-gray-900">
                  {formData.duration} hour(s)
                </span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-3 py-2 border-b">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <div>
                <span className="font-medium text-gray-700">Date</span>
                <p className="text-gray-900">
                  {format(new Date(formData.date), "PPPP")}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3 py-2">
              <ClockIcon className="h-4 w-4 text-purple-600" />
              <div>
                <span className="font-medium text-gray-700">Time</span>
                <p className="text-gray-900">{formData.time}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {isQuote ? (
            <>
              <Button size="lg" className="w-full" variant="primary-linear">
                <UserIcon className="h-4 w-4 mr-2" />
                Request Quote via Phone
              </Button>
              <Button size="lg" className="w-full" variant="outline">
                Request Quote via Email
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Ready to book instead?
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set("type", "book-now");
                    window.location.href = currentUrl.toString();
                  }}
                >
                  Complete Booking Now
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button size="lg" className="w-full" variant="primary-linear">
                Complete Booking & Payment
              </Button>
              <Button size="lg" className="w-full" variant="outline">
                Save & Book Later
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Need a quote first?
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  variant="secondary"
                  onClick={() => {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set("type", "quote");
                    window.location.href = currentUrl.toString();
                  }}
                >
                  Get Quote Instead
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Contact Info */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                Need Assistance?
              </h3>
              <p className="text-gray-600 mb-4">
                Our luxury transportation specialists are available 24/7
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="sm">
                  Call (214) 555-0123
                </Button>
                <Button variant="outline" size="sm">
                  Email Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your booking details...</p>
      </div>
    </div>
  );
}

export default function BookNowPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookNowContent />
    </Suspense>
  );
}
