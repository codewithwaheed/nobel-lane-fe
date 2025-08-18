"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import WizardProgress from "./WizardProgress";
import TripDetails from "./TripDetails";
import VehicleSelection from "./VehicleSelection";
import AdditionalInfo from "./AdditionalInfo";
import Payment from "./Payment";
import Confirmation from "./Confirmation";
import { getBookingData, clearBookingData } from "@/lib/booking-storage";
import type { BookingFormData, VehicleOption } from "@/lib/booking-storage";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LoginForm } from "./LoginForm";
import LoadingFallback from "./LoadingFallback";

interface BookingWizardProps {
  isQuote: boolean;
  onClose: () => void;
}

const steps = [
  { id: 1, name: "Trip Details", description: "Where and when" },
  { id: 2, name: "Service", description: "Choose your ride" },
  { id: 3, name: "Pickup Info", description: "Additional information" },
  { id: 4, name: "Payment", description: "Secure checkout" },
  { id: 5, name: "Confirmation", description: "All set!" },
];

const quoteSteps = [
  { id: 1, name: "Trip Details", description: "Where and when" },
  { id: 2, name: "Service", description: "Choose your ride" },
  { id: 3, name: "Contact", description: "Your information" },
  { id: 4, name: "Confirmation", description: "Request sent!" },
];

export default function BookingWizard({
  isQuote,
  onClose,
}: BookingWizardProps) {
  const [bookingData, setBookingData] = useState<BookingFormData>(() => {
    // Check if we're on the client side to avoid SSR issues
    if (typeof window === "undefined") {
      return {
        type: "one-way",
        from: "",
        to: "",
        date: "",
        time: "",
        submittedAt: "",
        passengers: 1,
        isQuote,
        currentStep: 1,
        completedSteps: [],
      };
    }

    // Read URL parameters for pre-filled data
    const urlParams = new URLSearchParams(window.location.search);
    const urlType = urlParams.get("type");
    const correctIsQuote = urlType === "quote" || isQuote;
    const isPrefilled = urlParams.get("prefilled") === "true";

    console.log("Starting fresh - checking URL parameters:", {
      urlType,
      correctIsQuote,
      isPrefilled,
      allParams: Object.fromEntries(urlParams.entries()),
    });

    // Initialize with default values
    let initialData: BookingFormData = {
      type: "one-way",
      from: "",
      to: "",
      date: "",
      time: "",
      submittedAt: "",
      passengers: 1,
      isQuote: correctIsQuote,
      quoteOrigin: urlType === "quote" ? "explicit" : undefined, // Track if this is an explicit quote request
      currentStep: 1,
      completedSteps: [],
    };

    // If data is pre-filled from BookingForm, populate from URL parameters
    if (isPrefilled) {
      const tripType = urlParams.get("tripType");
      const from = urlParams.get("from");
      const fromZipcode = urlParams.get("fromZipcode");
      const to = urlParams.get("to");
      const toZipcode = urlParams.get("toZipcode");
      const duration = urlParams.get("duration");
      const date = urlParams.get("date");
      const time = urlParams.get("time");

      initialData = {
        ...initialData,
        type: (tripType as "one-way" | "by-the-hour") || "one-way",
        from: from ? decodeURIComponent(from) : "",
        fromZipcode: fromZipcode || undefined,
        to: to ? decodeURIComponent(to) : "",
        toZipcode: toZipcode || undefined,
        duration: duration || undefined,
        date: date || "",
        time: time ? decodeURIComponent(time) : "",
        currentStep: 2, // Skip to vehicle selection since trip details are filled
      };

      console.log("Pre-filled data loaded:", initialData);
    }

    return initialData;
  });

  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(() => {
    // Check if we're on the client side to avoid SSR issues
    if (typeof window === "undefined") {
      return 1;
    }

    // Check if data is pre-filled from BookingForm
    const urlParams = new URLSearchParams(window.location.search);
    const isPrefilled = urlParams.get("prefilled") === "true";
    const from = urlParams.get("from");
    const date = urlParams.get("date");
    const time = urlParams.get("time");

    // If form is pre-filled with required data, skip to vehicle selection (step 2)
    if (isPrefilled && from && date && time) {
      console.log("Pre-filled form detected, advancing to step 2");
      return 2;
    }

    return 1; // Start at step 1 for empty forms
  });

  // Pricing status bubbled up from VehicleSelection
  const [pricingLoading, setPricingLoading] = useState(false);
  const [hasAnyPricing, setHasAnyPricing] = useState(false);
  const [forceQuoteFlow, setForceQuoteFlow] = useState(() => {
    // Check if we're on the client side to avoid SSR issues
    if (typeof window === "undefined") {
      return false;
    }

    // Initialize forceQuoteFlow based on URL or prop
    const urlParams = new URLSearchParams(window.location.search);
    const urlType = urlParams.get("type");

    if (urlType === "quote" || isQuote) return true;
    if (!urlType) return false; // Force booking mode for /book-now
    return false; // Default
  });

  // Handle URL parameter changes after navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlType = urlParams.get("type");
    const isPrefilled = urlParams.get("prefilled") === "true";

    console.log("BookingWizard useEffect - checking URL parameters:", {
      urlType,
      isPrefilled,
      bookingDataIsQuote: bookingData.isQuote,
      forceQuoteFlow,
      effectiveIsQuoteFlow: bookingData.isQuote || forceQuoteFlow,
    });

    // If data is pre-filled from BookingForm, populate from URL parameters
    if (isPrefilled) {
      const tripType = urlParams.get("tripType");
      const from = urlParams.get("from");
      const fromZipcode = urlParams.get("fromZipcode");
      const to = urlParams.get("to");
      const toZipcode = urlParams.get("toZipcode");
      const duration = urlParams.get("duration");
      const date = urlParams.get("date");
      const time = urlParams.get("time");

      const urlData = {
        type: (tripType as "one-way" | "by-the-hour") || "one-way",
        from: from ? decodeURIComponent(from) : "",
        fromZipcode: fromZipcode || undefined,
        to: to ? decodeURIComponent(to) : "",
        toZipcode: toZipcode || undefined,
        duration: duration || undefined,
        date: date || "",
        time: time ? decodeURIComponent(time) : "",
      };

      console.log("Pre-filled data from URL:", urlData);

      // Update booking data if any URL data exists
      if (urlData.from || urlData.date || urlData.time) {
        setBookingData((prev) => ({
          ...prev,
          ...urlData,
        }));

        // Skip to vehicle selection if we have the required data
        if (urlData.from && urlData.date && urlData.time) {
          console.log("Pre-filled form detected, advancing to step 2");
          setCurrentStep(2);
        }
      }
    }
  }, [bookingData.isQuote, forceQuoteFlow]); // Include dependencies

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Clear session storage when user navigates away or closes browser
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("Browser unload - clearing session storage");
      clearBookingData();
    };

    // Also clear on popstate (back/forward navigation)
    const handlePopState = () => {
      console.log("Browser navigation - clearing session storage");
      clearBookingData();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Persist booking data - DISABLED for simplicity
  // useEffect(() => {
  //   updateBookingData(bookingData);
  // }, [bookingData]);

  const updateBookingDataState = (updates: Partial<BookingFormData>) => {
    setBookingData((prev) => ({ ...prev, ...updates }));
  };

  const derivedSteps = (() => {
    // Use quote flow only when explicitly set (not based on pricing availability)
    const isQuoteFlow = bookingData.isQuote || forceQuoteFlow;

    if (isQuoteFlow) {
      return quoteSteps;
    }

    // Normal booking flow - add Sign In step if user not logged in
    if (!user) {
      return [
        { id: 1, name: "Trip Details", description: "Where and when" },
        { id: 2, name: "Service", description: "Choose your ride" },
        { id: 3, name: "Pickup Info", description: "Additional information" },
        { id: 4, name: "Sign In", description: "Access your account" },
        { id: 5, name: "Payment", description: "Secure checkout" },
        { id: 6, name: "Confirmation", description: "All set!" },
      ];
    }
    return steps;
  })();

  const maxStep = derivedSteps.length;
  const currentStepName = derivedSteps[currentStep - 1]?.name;

  // When pricing status changes, update the flow accordingly
  useEffect(() => {
    // Don't interfere with URL-based flows - respect explicit quote URLs
    const urlParams = new URLSearchParams(window.location.search);
    const urlType = urlParams.get("type");

    // For explicit quote URLs, don't auto-convert (they should stay as quote flow regardless of pricing)
    if (urlType === "quote") return; // Explicit quote URL - always stays quote flow

    // Only auto-convert booking flows (/book-now without params or with other params)
    if (currentStepName === "Service") {
      if (hasAnyPricing && !pricingLoading) {
        // Pricing is available - ensure we're in booking flow (undo any previous auto-conversion)
        if (forceQuoteFlow) {
          setForceQuoteFlow(false);
          updateBookingDataState({ isQuote: false });
        }
      } else if (!pricingLoading && !hasAnyPricing) {
        // No pricing available - auto-convert booking flow to quote flow
        if (!bookingData.isQuote && !forceQuoteFlow) {
          setForceQuoteFlow(true);
          updateBookingDataState({
            isQuote: true,
            quoteOrigin: "auto-fallback", // Mark as auto-converted due to no pricing
          });
        }
      }
    }
  }, [
    currentStepName,
    hasAnyPricing,
    pricingLoading,
    bookingData.isQuote,
    forceQuoteFlow,
    isQuote, // Add isQuote to dependencies
  ]);

  const handleNext = () => {
    // Special handling for Service step
    if (currentStepName === "Service") {
      // Block while pricing is loading to avoid false negatives
      if (pricingLoading) return;

      const selectedVehicle = bookingData.selectedVehicle as VehicleOption & {
        hasPricing?: boolean;
        pricingData?: { total: number };
      };

      // If we're in quote flow, just proceed to next step
      if (bookingData.isQuote || forceQuoteFlow) {
        if (currentStep < maxStep) setCurrentStep(currentStep + 1);
        return;
      }

      // In booking flow, check if selected vehicle has pricing
      const hasPricing =
        selectedVehicle?.hasPricing && !!selectedVehicle?.pricingData;

      if (!hasPricing && !hasAnyPricing) {
        // No pricing available anywhere - should already be in quote flow
        // This shouldn't happen due to useEffect, but handle it anyway
        setForceQuoteFlow(true);
        updateBookingDataState({ isQuote: true });
        return;
      }
    }

    if (currentStep < maxStep) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleTripDetailsSubmit = (data: Partial<BookingFormData>) => {
    updateBookingDataState(data);
    setCurrentStep(2);
  };

  const handleVehicleSelect = (vehicle: VehicleOption) => {
    updateBookingDataState({ selectedVehicle: vehicle });
  };

  const handleAdditionalInfoSubmit = (data: Partial<BookingFormData>) => {
    updateBookingDataState(data);
    if (bookingData.isQuote || forceQuoteFlow) {
      setCurrentStep(4); // Confirmation for quote flow
    } else {
      handleNext();
    }
  };

  const handlePaymentComplete = () => setCurrentStep(currentStep + 1);

  // Memoize the pricing status callback to prevent infinite re-renders
  const handlePricingStatus = useCallback(
    (s: { loading: boolean; hasAnyPricing: boolean }) => {
      setPricingLoading(s.loading);
      setHasAnyPricing(s.hasAnyPricing);
    },
    []
  );

  // Memoize tripData to prevent infinite re-renders in VehicleSelection
  const memoizedTripData = useMemo(() => {
    console.log("Memoizing trip data:", {
      type: bookingData.type,
      from: bookingData.from,
      to: bookingData.to,
      fromZipcode: bookingData.fromZipcode,
      toZipcode: bookingData.toZipcode,
      duration: bookingData.duration,
    });

    return {
      type: bookingData.type,
      // Use 'from' and 'to' fields from BookingForm, or fallback to fromZipcode/toZipcode from TripDetails
      fromZipcode: bookingData.fromZipcode || bookingData.from,
      toZipcode: bookingData.toZipcode || bookingData.to,
      duration: bookingData.duration,
    };
  }, [
    bookingData.type,
    bookingData.from,
    bookingData.to,
    bookingData.fromZipcode,
    bookingData.toZipcode,
    bookingData.duration,
  ]);

  const handleStartNew = () => {
    clearBookingData();
    setCurrentStep(1);
    // Reset quote flow flags to default (normal booking flow)
    setForceQuoteFlow(false);
    setHasAnyPricing(false);
    setPricingLoading(false);

    const fresh = getBookingData();
    setBookingData(
      fresh || {
        type: "one-way",
        from: "",
        to: "",
        date: "",
        time: "",
        submittedAt: "",
        passengers: 1,
        isQuote: false, // Default to normal booking flow
        currentStep: 1,
        completedSteps: [],
      }
    );
  };

  // Enhanced close handler that clears session storage
  const handleClose = useCallback(() => {
    clearBookingData();
    onClose();
  }, [onClose]);

  const canProceed = () => {
    switch (currentStepName) {
      case "Trip Details":
        return !!(bookingData.from && bookingData.date && bookingData.time);
      case "Service":
        return !!bookingData.selectedVehicle;
      case "Contact":
        return !!(bookingData.phone || bookingData.email);
      case "Pickup Info":
        return true;
      case "Sign In":
        return false; // controlled by LoginForm
      default:
        return true;
    }
  };

  // If user logs in while on the Sign In step, proceed automatically
  useEffect(() => {
    if (currentStepName === "Sign In" && user) {
      setCurrentStep((s) => Math.min(s + 1, maxStep));
    }
  }, [currentStepName, user, maxStep]);

  const renderStepContent = () => {
    switch (currentStepName) {
      case "Trip Details":
        return (
          <TripDetails
            bookingData={bookingData}
            onSubmit={handleTripDetailsSubmit}
          />
        );
      case "Service":
        // Debug logging for pricing display troubleshooting
        console.log("BookingWizard Service step:", {
          "bookingData.isQuote": bookingData.isQuote,
          forceQuoteFlow,
          "isQuoteFlow passed to VehicleSelection":
            bookingData.isQuote || forceQuoteFlow,
          url: window.location.href,
        });

        return (
          <VehicleSelection
            selectedVehicle={bookingData.selectedVehicle}
            onVehicleSelect={handleVehicleSelect}
            showPricing={true} // Always show pricing UI, but VehicleSelection will handle display logic
            isQuoteFlow={bookingData.isQuote || forceQuoteFlow}
            quoteOrigin={bookingData.quoteOrigin}
            onNext={handleNext}
            onPrevious={handleBack}
            canGoNext={!!bookingData.selectedVehicle}
            canGoPrevious={currentStep > 1}
            onPricingStatus={handlePricingStatus}
            tripData={memoizedTripData}
          />
        );
      case "Pickup Info":
      case "Contact":
        return (
          <AdditionalInfo
            isQuote={bookingData.isQuote || forceQuoteFlow}
            bookingData={bookingData}
            onSubmit={handleAdditionalInfoSubmit}
            onBack={handleBack}
          />
        );
      case "Sign In":
        // Never shown in quote flow
        if (bookingData.isQuote || forceQuoteFlow) return null;
        return (
          <div className="max-w-md mx-auto">
            <LoginForm
              showTitle={false}
              className="mt-0 md:mt-0 lg:mt-0"
              onSuccess={(u) => setUser(u as User)}
            />
          </div>
        );
      case "Payment":
        if (bookingData.isQuote || forceQuoteFlow) {
          return (
            <Confirmation
              isQuote={true}
              bookingData={bookingData}
              onStartNew={handleStartNew}
            />
          );
        }
        return (
          <Payment
            bookingData={bookingData}
            onPaymentComplete={handlePaymentComplete}
            onBack={handleBack}
          />
        );
      case "Confirmation":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Confirmation
              isQuote={bookingData.isQuote || forceQuoteFlow}
              bookingData={bookingData}
              onStartNew={handleStartNew}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-20">
      <WizardProgress
        steps={derivedSteps}
        currentStep={currentStep}
        title={
          bookingData.isQuote || forceQuoteFlow
            ? "Request Quote"
            : "Book Your Trip"
        }
        onBack={handleClose}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-8 sm:mb-12">
        {renderStepContent()}
      </div>

      {currentStepName === "Service" && !bookingData.selectedVehicle && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep <= 1}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
