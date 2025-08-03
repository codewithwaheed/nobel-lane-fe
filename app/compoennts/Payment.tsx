"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, Calendar, MapPin, Users, Car } from "lucide-react";
import { VehicleOption } from "@/lib/booking-storage";

interface PaymentProps {
  bookingData: {
    from: string;
    to?: string;
    date: string;
    time: string;
    passengers: number;
    selectedVehicle?: VehicleOption;
    flightNumber?: string;
    notes?: string;
  };
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

  const total = bookingData.selectedVehicle?.price || 0;
  const serviceFee = Math.round(total * 0.05); // 5% service fee
  const grandTotal = total + serviceFee;

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
                    : `Complete Payment $${grandTotal}`}
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

            {/* Pricing Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">Price Breakdown</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base fare</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee</span>
                  <span>${serviceFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <h5 className="font-medium text-amber-800 mb-2">
                Cancellation Policy
              </h5>
              <p className="text-sm text-amber-700">
                Free cancellation up to 24 hours before your trip. 50% refund
                for cancellations within 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
