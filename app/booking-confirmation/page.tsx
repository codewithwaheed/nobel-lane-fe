"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import LoadingFallback from "../compoennts/LoadingFallback";

function BookingConfirmationComponent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  useEffect(() => {
    const clientSecret = searchParams.get("payment_intent_client_secret");
    // const paymentIntentId = searchParams.get("payment_intent");

    if (clientSecret) {
      // Verify payment status with Stripe
      import("@stripe/stripe-js").then(({ loadStripe }) => {
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").then(
          (stripe) => {
            if (stripe) {
              stripe
                .retrievePaymentIntent(clientSecret)
                .then(({ paymentIntent }) => {
                  if (paymentIntent) {
                    setPaymentIntent(paymentIntent);
                    if (paymentIntent.status === "succeeded") {
                      setStatus("success");
                    } else {
                      setStatus("error");
                    }
                  } else {
                    setStatus("error");
                  }
                })
                .catch(() => {
                  setStatus("error");
                });
            }
          }
        );
      });
    } else {
      setStatus("error");
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Confirming your payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your booking.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              There was an issue processing your payment. Please try again or
              contact support.
            </p>
            <div className="space-y-3">
              <Link href="/book-now">
                <Button className="w-full">Try Again</Button>
              </Link>
              <p className="text-sm text-gray-500">
                Need help? Call us at{" "}
                <a
                  href="tel:+12142250105"
                  className="text-amber-600 hover:underline"
                >
                  (214) 225-0105
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. You&apos;ll receive a confirmation
            email shortly.
          </p>

          {paymentIntent && (
            <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
              <div className="text-sm space-y-1">
                <div>
                  <strong>Payment ID:</strong> {paymentIntent.id}
                </div>
                <div>
                  <strong>Amount:</strong> $
                  {(paymentIntent.amount / 100).toFixed(2)}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className="text-green-600 capitalize">
                    {paymentIntent.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full">Return Home</Button>
            </Link>
            <Link href="/book-now">
              <Button variant="outline" className="w-full">
                Book Another Trip
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Questions? Contact us at{" "}
            <a
              href="mailto:office@gonoblelane.com"
              className="text-amber-600 hover:underline"
            >
              office@gonoblelane.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={<LoadingFallback message="Loading booking confirmation..." />}
    >
      <BookingConfirmationComponent />
    </Suspense>
  );
}
export default BookingConfirmationPage