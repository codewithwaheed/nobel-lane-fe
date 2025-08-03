"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Car,
} from "lucide-react";
import { VehicleOption } from "@/lib/booking-storage";

interface ConfirmationProps {
  isQuote: boolean;
  bookingData: {
    from: string;
    to?: string;
    date: string;
    time: string;
    passengers: number;
    selectedVehicle?: VehicleOption;
    phone?: string;
    email?: string;
    flightNumber?: string;
    notes?: string;
  };
  onStartNew: () => void;
}

export default function Confirmation({
  isQuote,
  bookingData,
  onStartNew,
}: ConfirmationProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="mb-8">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isQuote ? "Quote Request Submitted!" : "Booking Confirmed!"}
        </h2>
        <p className="text-gray-600 text-lg">
          {isQuote
            ? "We'll send your personalized quote shortly"
            : "Your luxury transportation has been secured"}
        </p>
      </div>

      {/* Booking Summary */}
      <Card className="text-left mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isQuote ? "Quote Details" : "Booking Summary"}
          </h3>

          <div className="space-y-4">
            {/* Trip Details */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Trip Route</div>
                <div className="text-gray-600">
                  From: {bookingData.from}
                  {bookingData.to && (
                    <>
                      <br />
                      To: {bookingData.to}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Date & Time</div>
                <div className="text-gray-600">
                  {new Date(bookingData.date).toLocaleDateString()} at{" "}
                  {bookingData.time}
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Passengers</div>
                <div className="text-gray-600">
                  {bookingData.passengers} passenger(s)
                </div>
              </div>
            </div>

            {/* Vehicle */}
            {bookingData.selectedVehicle && (
              <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Vehicle</div>
                  <div className="text-gray-600">
                    {bookingData.selectedVehicle.name}
                    {!isQuote && (
                      <span className="ml-2 font-semibold text-amber-600">
                        ${bookingData.selectedVehicle.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info for Quote */}
            {isQuote && (bookingData.phone || bookingData.email) && (
              <>
                {bookingData.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Phone</div>
                      <div className="text-gray-600">{bookingData.phone}</div>
                    </div>
                  </div>
                )}
                {bookingData.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-gray-600">{bookingData.email}</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Flight Number */}
            {bookingData.flightNumber && (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-amber-500 mt-0.5 text-xs font-bold flex items-center justify-center">
                  ✈
                </div>
                <div>
                  <div className="font-medium text-gray-900">Flight Number</div>
                  <div className="text-gray-600">
                    {bookingData.flightNumber}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            What happens next?
          </h4>
          <div className="text-left space-y-2 text-gray-700">
            {isQuote ? (
              <>
                <p className="flex items-center">
                  <span className="w-6 h-6 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center mr-3">
                    1
                  </span>
                  You&apos;ll receive a detailed quote via email within 1 hour
                </p>
                <p className="flex items-center">
                  <span className="w-6 h-6 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center mr-3">
                    2
                  </span>
                  Our team will contact you to discuss any special requirements
                </p>
                <p className="flex items-center">
                  <span className="w-6 h-6 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center mr-3">
                    3
                  </span>
                  Book your trip when you&apos;re ready
                </p>
              </>
            ) : (
              <>
                <p className="flex items-center">
                  <span className="w-6 h-6 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center mr-3">
                    1
                  </span>
                  You&apos;ll receive a confirmation email shortly
                </p>
                <p className="flex items-center">
                  <span className="w-6 h-6 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center mr-3">
                    2
                  </span>
                  Our team will contact you 24 hours before your trip
                </p>
                <p className="flex items-center">
                  <span className="w-6 h-6 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center mr-3">
                    3
                  </span>
                  Your chauffeur will arrive 15 minutes early
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-8 space-y-4">
        <Button
          onClick={onStartNew}
          variant="outline"
          className="w-full md:w-auto px-8"
        >
          {isQuote ? "Request Another Quote" : "Book Another Trip"}
        </Button>

        <div className="text-sm text-gray-500">
          Questions? Contact us at{" "}
          <a href="tel:+12142250105" className="text-amber-600 hover:underline">
            (214) 225-0105
          </a>{" "}
          or{" "}
          <a
            href="mailto:info@gonoblelane.com"
            className="text-amber-600 hover:underline"
          >
            info@gonoblelane.com
          </a>
        </div>
      </div>
    </div>
  );
}
