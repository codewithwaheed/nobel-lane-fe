"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DollarSign,
} from "lucide-react";
import { BookingFormData } from "@/lib/booking-storage";
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
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { clearBookingData } from "@/lib/booking-storage";

interface PaymentProps {
  bookingData: BookingFormData;
  onPaymentComplete: () => void;
  onBack: () => void;
}

// Extended interface for PaymentForm with calculated pricing
interface PaymentFormProps extends PaymentProps {
  pricingData: {
    base: ReturnType<typeof calculatePricingBreakdown>;
    extras: ReturnType<typeof calculatePricingExtras>;
    extraStopsCount: number;
    tolls: number;
    extrasOnly: number;
    subtotal: number;
    gratuityRate: number;
    totalPrice: number;
  };
  recommendations: string[];
}

// Stripe Payment Form Component
function PaymentForm({
  bookingData,
  onPaymentComplete,
  onBack,
  pricingData,
  recommendations,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    base,
    extras,
    extraStopsCount,
    tolls,
    extrasOnly,
    gratuityRate,
    totalPrice,
  } = pricingData;

  // Function to verify booking was created
  const verifyBookingCreation = async (
    paymentIntentId: string,
    maxAttempts = 5
  ) => {
    console.log("🔍 Verifying booking creation for payment:", paymentIntentId);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(
          `🔍 Verification attempt ${attempt}/${maxAttempts} for payment: ${paymentIntentId}`
        );

        // Use edge function to verify booking (bypasses RLS issues)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-booking`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              paymentIntentId,
            }),
          }
        );

        if (!response.ok) {
          console.log(`❌ Verification request failed: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`📋 Verification result:`, data);

        if (data.success && data.found) {
          console.log("✅ Booking verified via edge function:", data.booking);
          return true;
        }

        console.log(
          `⏳ Booking not found yet (attempt ${attempt}/${maxAttempts}), retrying...`
        );

        // Wait before next attempt (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      } catch (error) {
        console.log("❌ Error checking booking:", error);
      }
    }

    console.log("⚠️ Booking verification failed after all attempts");
    return false;
  };

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
        },
        redirect: "if_required",
      });

      if (error) {
        // Show user-friendly error message
        setErrorMessage(
          error.message || "An unexpected error occurred. Please try again."
        );
        console.error("Payment failed:", error);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded - log details for debugging
        console.log("✅ Payment succeeded!", {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        });

        // Verify booking was created by webhook before proceeding
        console.log("🔄 Waiting for webhook to process booking...");
        console.log(
          `🔍 Looking for booking with payment intent ID: ${paymentIntent.id}`
        );

        const bookingCreated = await verifyBookingCreation(paymentIntent.id);

        if (bookingCreated) {
          console.log("🎯 Booking verified! Proceeding to confirmation...");

          // Clear the booking form data from session storage
          try {
            clearBookingData();
            console.log("✅ Booking form data cleared from storage");
          } catch (error) {
            console.warn("⚠️ Failed to clear booking data:", error);
          }

          onPaymentComplete();
        } else {
          console.log("❌ Booking was not created by webhook");
          console.log(`🔍 Searched for payment intent: ${paymentIntent.id}`);

          setErrorMessage(
            "Payment succeeded, but booking was not processed. Please contact support with payment ID: " +
              paymentIntent.id
          );
        }
      } else {
        // Payment requires further action or failed
        console.log("⚠️ Payment not completed:", paymentIntent);
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
              <CreditCard className="w-5 h-5" /> Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
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
                            email: "auto",
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
                </div>
              </div>

              {/* Spacer for better visual separation */}
              <div className="py-4"></div>

              {/* Secure Payment Info - Moved to end for better spacing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  Your payment information is secure and encrypted by Stripe
                </div>
              </div>

              {/* Action Buttons - Moved to end for better spacing */}
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
                    : `Complete Payment ${formatPrice(totalPrice)}`}
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

            {recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" /> Trip Details
                </h4>
                <div className="space-y-1">
                  {recommendations.slice(0, 2).map((rec, i) => (
                    <div
                      key={i}
                      className="text-xs text-gray-600 bg-blue-50 p-2 rounded"
                    >
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" /> Price
                Breakdown
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base fare</span>
                  <span className="font-medium">
                    {formatPrice(base.baseRate)}
                  </span>
                </div>

                {extrasOnly > 0 && (
                  <div className="flex justify-between">
                    <div>
                      <span className="text-gray-600">Additional services</span>
                      <div className="text-xs text-gray-500">
                        {[
                          extras.internationalArrival > 0 &&
                            "International arrival",
                          extras.earlyLatePickup > 0 && "Early/late pickup",
                          extras.holiday > 0 && "Holiday surcharge",
                          extras.extraStops > 0 &&
                            extraStopsCount > 0 &&
                            `${extraStopsCount} extra stop${
                              extraStopsCount === 1 ? "" : "s"
                            }`,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                    <span className="font-medium">
                      {formatPrice(extrasOnly)}
                    </span>
                  </div>
                )}

                {tolls > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated tolls</span>
                    <span className="font-medium">{formatPrice(tolls)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <div>
                    <span className="text-gray-600">Gratuity (20%)</span>
                    <div className="text-xs text-gray-500">
                      100% goes to driver
                    </div>
                  </div>
                  <span className="font-medium">
                    {formatPrice(gratuityRate)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const paymentIntentCreated = useRef(false);

  // Get current authenticated user and listen for auth changes
  useEffect(() => {
    const supabase = createClient();

    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
      setAuthLoading(false); // Auth loading complete
    };

    getCurrentUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Auth state changed:", event, session?.user?.email);
      setCurrentUser(session?.user || null);
      setAuthLoading(false); // Auth loading complete
    });

    return () => subscription.unsubscribe();
  }, []);

  // Calculate all pricing data once in parent component
  const pricingData = useMemo(() => {
    const base = calculatePricingBreakdown(props.bookingData);
    const extras = calculatePricingExtras(props.bookingData);

    const extraStopsCount = Number(props.bookingData?.extraStopsCount ?? 0);
    const tolls = Number(extras.dfwToll || 0);
    const extrasOnly =
      Number(extras.extraStops || 0) +
      Number(extras.internationalArrival || 0) +
      Number(extras.earlyLatePickup || 0) +
      Number(extras.holiday || 0);

    const subtotal = Number((base.baseRate + tolls + extrasOnly).toFixed(2));
    const gratuityRate = Number((subtotal * 0.2).toFixed(2));
    const totalPrice = Number((subtotal + gratuityRate).toFixed(2));

    return {
      base,
      extras,
      extraStopsCount,
      tolls,
      extrasOnly,
      subtotal,
      gratuityRate,
      totalPrice,
    };
  }, [props.bookingData]);

  const recommendations = useMemo(
    () =>
      getSmartRecommendations(
        props.bookingData,
        props.bookingData?.selectedVehicle
      ),
    [props.bookingData]
  );

  // Create payment intent when component mounts
  React.useEffect(() => {
    const createPaymentIntent = async () => {
      if (paymentIntentCreated.current || clientSecret) {
        console.log("⏳ Payment intent already created, skipping...");
        return;
      }

      // Wait for user authentication to load
      // We need to know if user is logged in to include proper metadata
      if (authLoading) {
        console.log(
          "⏳ Waiting for user authentication to load for regular booking..."
        );
        return;
      }

      paymentIntentCreated.current = true;

      try {
        // Log user information for debugging
        console.log("👤 Current user:", {
          id: currentUser?.id,
          email: currentUser?.email,
          authenticated: !!currentUser,
        });

        console.log("📝 Booking data:", {
          email: props.bookingData.email,
          phone: props.bookingData.phone,
          isQuote: props.bookingData.isQuote,
        });

        // Determine final user information based on auth status and quote vs regular booking
        const finalUserId = currentUser?.id || null;
        const finalUserEmail =
          currentUser?.email || props.bookingData.email || "";
        // Check multiple possible locations for phone number
        const finalUserPhone =
          currentUser?.user_metadata?.phone ||
          currentUser?.phone ||
          props.bookingData.phone ||
          "";

        console.log("🔄 Final user info:", {
          userId: finalUserId,
          userEmail: finalUserEmail,
          userPhone: finalUserPhone,
          isQuoteFlow: props.bookingData.isQuote,
        });

        // Create comprehensive booking data with pricing breakdown for payment intent
        const enrichedBookingData = {
          ...props.bookingData,
          // Add user information (for regular bookings, prefer authenticated user; for quotes, use form data)
          userId: finalUserId,
          userEmail: finalUserEmail,
          userPhone: finalUserPhone,
          // Add detailed pricing breakdown to metadata
          pricingBreakdown: {
            baseRate: pricingData.base.baseRate,
            tolls: pricingData.tolls,
            extrasOnly: pricingData.extrasOnly,
            extraStopsCount: pricingData.extraStopsCount,
            subtotal: pricingData.subtotal,
            gratuityRate: pricingData.gratuityRate,
            totalPrice: pricingData.totalPrice,
            // Detailed extras breakdown
            extras: {
              extraStops: pricingData.extras.extraStops,
              internationalArrival: pricingData.extras.internationalArrival,
              earlyLatePickup: pricingData.extras.earlyLatePickup,
              holiday: pricingData.extras.holiday,
              dfwToll: pricingData.extras.dfwToll,
            },
          },
          // Add recommendations to metadata
          recommendations: recommendations.slice(0, 3), // Limit to 3 recommendations for metadata
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              amount: pricingData.totalPrice, // Use calculated total price
              currency: "usd",
              bookingData: enrichedBookingData,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setClientSecret(data.clientSecret);
        console.log("✅ Payment intent created successfully");
      } catch (error) {
        console.error("Error creating payment intent:", error);
        setPaymentIntentError(
          "Unable to initialize payment. Please refresh the page and try again."
        );
        paymentIntentCreated.current = false; // Reset on error so it can be retried
      }
    };

    // Only create payment intent for regular bookings if we don't already have one and have a valid total
    if (pricingData.totalPrice > 0 && !clientSecret) {
      createPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, currentUser]); // Re-run when authentication changes

  // Show error if payment intent creation failed
  if (paymentIntentError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Payment Setup Error</span>
              </div>
              <p className="text-sm text-red-600 mb-4">{paymentIntentError}</p>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
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

  // Show login prompt for regular bookings (non-quotes) when user is not authenticated
  const shouldPromptLogin = !props.bookingData.isQuote && !currentUser;

  return (
    <div className="max-w-4xl mx-auto">
      {shouldPromptLogin && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800">
                Sign in recommended
              </h3>
              <div className="mt-1 text-sm text-amber-700">
                <p>
                  Sign in to save your booking details, track your trips, and
                  get a better experience. You can continue as a guest, but we
                  recommend signing in.
                </p>
              </div>
              <div className="mt-3 flex gap-3">
                <a
                  href="/auth?redirectTo=/book-now"
                  className="text-sm bg-amber-600 text-white px-3 py-1.5 rounded-md hover:bg-amber-700 transition-colors"
                >
                  Sign In
                </a>
                <button
                  type="button"
                  className="text-sm text-amber-700 hover:text-amber-800"
                  onClick={() => {
                    // You can add analytics tracking here
                    console.log("User chose to continue as guest");
                  }}
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <StripeProvider clientSecret={clientSecret}>
        <PaymentForm
          {...props}
          pricingData={pricingData}
          recommendations={recommendations}
        />
      </StripeProvider>
    </div>
  );
}
