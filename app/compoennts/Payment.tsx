"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Lock,
  Calendar,
  MapPin,
  Users,
  Car,
  Info,
} from "lucide-react";
import { BookingFormData, VehicleOption } from "@/lib/booking-storage";
import {
  calculatePricingBreakdown,
  calculatePricingExtras,
  formatPrice,
  getSmartRecommendations,
} from "@/lib/pricing-logic";

interface PaymentProps {
  bookingData: BookingFormData;
  onPaymentComplete: () => void;
  onBack: () => void;
}

export default function Payment({
  bookingData,
  onPaymentComplete,
  onBack,
}: PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardholderName: "",
    billingAddress: "",
    billingCity: "",
    billingZip: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, "");
    // Add spaces every 4 digits
    return numbers.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, "");
    // Add slash after 2 digits
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + "/" + numbers.substring(2, 4);
    }
    return numbers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      onPaymentComplete();
    }, 2000);
  };

  // Calculate detailed pricing breakdown
  const pricingBreakdown = calculatePricingBreakdown(bookingData);
  const extras = calculatePricingExtras(bookingData);
  const recommendations = getSmartRecommendations(bookingData);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "cardNumber",
                        formatCardNumber(e.target.value)
                      )
                    }
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) =>
                        handleInputChange(
                          "expiryDate",
                          formatExpiryDate(e.target.value)
                        )
                      }
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      type="text"
                      placeholder="123"
                      value={paymentData.cvc}
                      onChange={(e) =>
                        handleInputChange(
                          "cvc",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    type="text"
                    placeholder="John Doe"
                    value={paymentData.cardholderName}
                    onChange={(e) =>
                      handleInputChange("cardholderName", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Billing Address */}
              <div className="space-y-4">
                <h4 className="font-medium">Billing Address</h4>

                <div>
                  <Label htmlFor="billingAddress">Address</Label>
                  <Input
                    id="billingAddress"
                    type="text"
                    placeholder="123 Main Street"
                    value={paymentData.billingAddress}
                    onChange={(e) =>
                      handleInputChange("billingAddress", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingCity">City</Label>
                    <Input
                      id="billingCity"
                      type="text"
                      placeholder="Dallas"
                      value={paymentData.billingCity}
                      onChange={(e) =>
                        handleInputChange("billingCity", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingZip">ZIP Code</Label>
                    <Input
                      id="billingZip"
                      type="text"
                      placeholder="75201"
                      value={paymentData.billingZip}
                      onChange={(e) =>
                        handleInputChange(
                          "billingZip",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      maxLength={5}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  Your payment information is secure and encrypted
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {isProcessing
                    ? "Processing..."
                    : `Complete Payment ${formatPrice(
                        pricingBreakdown.totalPrice
                      )}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trip Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Trip Route</div>
                  <div className="text-gray-600 text-sm">
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

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Date & Time</div>
                  <div className="text-gray-600 text-sm">
                    {new Date(bookingData.date).toLocaleDateString()} at{" "}
                    {bookingData.time}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Passengers</div>
                  <div className="text-gray-600 text-sm">
                    {bookingData.passengers} passenger(s)
                  </div>
                </div>
              </div>

              {bookingData.selectedVehicle && (
                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Vehicle</div>
                    <div className="text-gray-600 text-sm">
                      {bookingData.selectedVehicle.name}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Smart Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Trip Details
                </h4>
                <div className="space-y-1">
                  {recommendations.slice(0, 2).map((recommendation, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-600 bg-blue-50 p-2 rounded"
                    >
                      {recommendation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Concise Pricing Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">Price Breakdown</h4>

              <div className="space-y-2 text-sm">
                {/* Base Rate */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Base fare</span>
                  <span className="font-medium">
                    {formatPrice(pricingBreakdown.baseRate)}
                  </span>
                </div>

                {/* Gratuity */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Gratuity (20%)</span>
                  <span className="font-medium">
                    {formatPrice(pricingBreakdown.gratuityRate)}
                  </span>
                </div>

                {/* Additional Services - Condensed */}
                {pricingBreakdown.extrasRate > 0 && (
                  <div className="flex justify-between">
                    <div>
                      <span className="text-gray-600">Additional services</span>
                      <div className="text-xs text-gray-500">
                        {[
                          extras.flightTracking > 0 && "Flight tracking",
                          extras.internationalArrival > 0 &&
                            "International arrival",
                          extras.earlyLatePickup > 0 && "Early/late pickup",
                          extras.extraStops > 0 &&
                            `${pricingBreakdown.breakdown.extraStopsCount} extra stops`,
                          extras.dfwToll > 0 && "DFW toll",
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                    <span className="font-medium">
                      {formatPrice(pricingBreakdown.extrasRate)}
                    </span>
                  </div>
                )}

                {/* Estimated Tolls */}
                {pricingBreakdown.tollsRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated tolls</span>
                    <span className="font-medium">
                      {formatPrice(pricingBreakdown.tollsRate)}
                    </span>
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(pricingBreakdown.totalPrice)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
