"use client";

import React, { useState } from "react";
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
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import StripeProvider from "@/app/contexts/StripeProvider";
import {
  calculatePricingBreakdown,
  calculatePricingExtras,
  formatPrice,
  getSmartRecommendations,
} from "@/lib/pricing-logic";

interface PaymentProps {
  bookingData: BookingFormData;
  user?: any; // Supabase user object
  onPaymentComplete: () => void;
  onBack: () => void;
}

// Stripe Payment Form Component
function PaymentForm({
  bookingData,
  user,
  onPaymentComplete,
  onBack,
}: PaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Calculate detailed pricing breakdown
  const pricingBreakdown = calculatePricingBreakdown(bookingData);
  const extras = calculatePricingExtras(bookingData);
  const recommendations = getSmartRecommendations(bookingData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(""); // Clear any previous errors

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
          payment_method_data: user?.email ? {
            billing_details: {
              email: user.email,
            },
          } : undefined,
        },
        redirect: "if_required",
      });

      if (error) {
        // Show user-friendly error message
        setErrorMessage(
          error.message || "An unexpected error occurred. Please try again."
        );
        console.error("Payment failed:", error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onPaymentComplete();
      } else {
        // Payment requires further action or failed
        setErrorMessage("Payment was not completed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Payment Failed</span>
                  </div>
                  <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* Stripe Payment Element */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment">Card Details</Label>
                  <div className="mt-2">
                    <PaymentElement
                      id="payment"
                      options={{
                        layout: "tabs",
                        fields: {
                          billingDetails: {
                            name: "auto",
                            email: user ? "never" : "auto", // Hide email field if user is logged in
                            phone: "auto",
                            address: "auto", // Enable address collection
                          },
                        },
                        terms: {
                          card: "never", // Don't show terms for cards
                        },
                      }}
                    />
                  </div>
                  {user && (
                    <p className="text-xs text-gray-500 mt-2">
                      Booking confirmation will be sent to: <strong>{user.email}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  Your payment information is secure and encrypted by Stripe
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
                  disabled={isProcessing || !stripe || !elements}
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

// Main Payment Component with Stripe Provider
export default function Payment(props: PaymentProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentError, setPaymentIntentError] = useState<string>("");
  const total = props.bookingData.selectedVehicle?.price || 0;
  const serviceFee = Math.round(total * 0.05); // 5% service fee
  const grandTotal = total + serviceFee;

  // Create payment intent when component mounts
  React.useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // Use user's email if available, fallback to bookingData email
        const bookingDataWithEmail = {
          ...props.bookingData,
          email: props.user?.email || props.bookingData.email
        };

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: grandTotal,
            currency: 'usd',
            bookingData: bookingDataWithEmail,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setPaymentIntentError('Unable to initialize payment. Please refresh the page and try again.');
      }
    };

    if (grandTotal > 0) {
      createPaymentIntent();
    }
  }, [grandTotal, props.bookingData, props.user]);

  // Show error if payment intent creation failed
  if (paymentIntentError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Payment Setup Error</span>
              </div>
              <p className="text-sm text-red-600 mb-4">{paymentIntentError}</p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Setting up payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <PaymentForm {...props} />
    </StripeProvider>
  );
}
