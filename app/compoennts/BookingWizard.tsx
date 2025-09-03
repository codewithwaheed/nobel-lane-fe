"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
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
    const quoteId = urlParams.get("quoteId"); // Check for quote ID parameter
    const correctIsQuote = urlType === "quote" || isQuote;
    const isPrefilled = urlParams.get("prefilled") === "true";

    console.log("Starting fresh - checking URL parameters:", {
      urlType,
      quoteId,
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
  const [isLoadingQuote, setIsLoadingQuote] = useState(false); // Loading state for quote fetching
  const quoteFetchedRef = useRef<string | null>(null); // Track which quote ID has been fetched to prevent duplicates
  const router = useRouter(); // For navigation
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

  // Handle quote pre-filling from URL quoteId parameter
  useEffect(() => {
    const fetchQuoteDetails = async (quoteId: string) => {
      // Prevent duplicate calls
      if (quoteFetchedRef.current === quoteId || isLoadingQuote) {
        console.log("Quote fetch prevented - already processing:", quoteId);
        return;
      }

      // Also prevent if we already have quote data loaded
      if (
        bookingData.from &&
        bookingData.date &&
        bookingData.time &&
        quoteFetchedRef.current
      ) {
        console.log("Quote data already loaded, skipping fetch");
        return;
      }

      try {
        quoteFetchedRef.current = quoteId; // Mark this quote as being fetched
        setIsLoadingQuote(true); // Start loading
        console.log("Fetching quote details for ID:", quoteId);

        const { getCleanSupabaseUrl, getSupabaseAnonKey } = await import(
          "@/lib/supabase-env"
        );
        const supabaseUrl = getCleanSupabaseUrl();
        const supabaseKey = getSupabaseAnonKey();

        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase configuration missing");
        }

        // Use the correct Supabase Edge Functions endpoint with GET request
        const response = await fetch(
          `${supabaseUrl}/functions/v1/get-quote-details?quoteId=${encodeURIComponent(
            quoteId
          )}`,
          {
            method: "GET", // Use GET as the function expects GET
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              apikey: supabaseKey,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch quote (${response.status}): ${errorText}`
          );
        }

        const result = await response.json();
        console.log("Quote fetch result:", result);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Quote not found");
        }

        const quoteData = result.data;
        console.log("Quote data received:", quoteData);

        // Convert 24-hour time format to 12-hour AM/PM format for the form
        const convertTo12HourFormat = (time24: string): string => {
          if (!time24) return "";

          // Parse time like "02:30:00" or "14:30:00"
          const [hours, minutes] = time24.split(":");
          const hour24 = parseInt(hours, 10);
          const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
          const ampm = hour24 >= 12 ? "PM" : "AM";

          return `${hour12}:${minutes} ${ampm}`;
        };

        // Convert database trip_type back to frontend format
        const convertTripTypeToFrontend = (
          dbTripType: string
        ): "one-way" | "by-the-hour" => {
          switch (dbTripType) {
            case "hourly":
              return "by-the-hour";
            case "one-way":
              return "one-way";
            default:
              return "one-way"; // Default fallback
          }
        };

        // Transform quote data to BookingFormData format
        const transformedData: Partial<BookingFormData> = {
          type: convertTripTypeToFrontend(quoteData.trip_type || "one-way"),
          from: quoteData.pickup_location || "",
          fromZipcode: quoteData.pickup_zipcode || "",
          to: quoteData.dropoff_location || "",
          toZipcode:
            quoteData.destination_zipcode || quoteData.pickup_zipcode || "", // Fallback to pickup zipcode if dropoff not available
          duration: quoteData.duration || undefined,
          date: quoteData.pickup_date || "",
          // Convert 24-hour time to 12-hour AM/PM format to match time slots
          time: convertTo12HourFormat(quoteData.pickup_time || ""),
          passengers: quoteData.passengers || 1,
          // Vehicle selection from quote - create VehicleOption object
          selectedVehicle: quoteData.vehicle_type
            ? {
                id: parseInt(quoteData.vehicle_type) || 0,
                name: quoteData.vehicle_name || "",
                vehicleId: quoteData.vehicle_type || "",
                image: "", // Will be populated by VehicleSelection component
                passengers: 0, // Will be populated by VehicleSelection component
                bags: 0, // Will be populated by VehicleSelection component
                price: 0, // Will be populated by VehicleSelection component
                description: "", // Will be populated by VehicleSelection component
              }
            : undefined,
          // Customer info
          phone: quoteData.customer_phone || "",
          email: quoteData.customer_email || "",
          // Set as booking flow (not quote) since user is converting to booking
          isQuote: false,
          currentStep: 2, // Always go to vehicle selection step so user can see/change the pre-selected vehicle
        };

        console.log("Transformed quote data:", transformedData);
        console.log("Email field value:", transformedData.email);
        console.log("From field value:", transformedData.from);
        console.log("Original quote data email:", quoteData.customer_email);
        console.log("Original quote data pickup:", quoteData.pickup_location);

        // Update booking data with quote details
        setBookingData((prev) => ({
          ...prev,
          ...transformedData,
        }));

        // Advance to the appropriate step based on available data
        const targetStep = transformedData.currentStep || 2;
        console.log(
          `Quote pre-filled, advancing to step ${targetStep} ${
            targetStep === 3
              ? "(additional info - vehicle already selected)"
              : "(vehicle selection)"
          }`
        );
        setCurrentStep(targetStep);
      } catch (error) {
        console.error("Error fetching quote details:", error);
        // Show error message but don't break the flow - user can still use wizard normally
        alert(
          `Error loading quote details: ${
            error instanceof Error ? error.message : "Unknown error"
          }. You can still proceed with normal booking.`
        );
      } finally {
        setIsLoadingQuote(false); // Stop loading
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get("quoteId");

    if (quoteId && quoteFetchedRef.current !== quoteId) {
      console.log("Quote ID detected in URL:", quoteId);
      fetchQuoteDetails(quoteId);
    } else if (quoteId) {
      console.log(
        "Quote already processed:",
        quoteId,
        "Current ref:",
        quoteFetchedRef.current
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount - isLoadingQuote check is inside fetchQuoteDetails

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

  // Convert from quote flow to full booking flow while staying on this step
  const handleConvertQuoteToBooking = (data?: Partial<BookingFormData>) => {
    // Persist any current additional info first
    if (data) {
      updateBookingDataState(data);
    }
    // Switch flows explicitly
    setForceQuoteFlow(false);
    setBookingData((prev) => ({ ...prev, isQuote: false }));
    // Stay on AdditionalInfo step in booking flow (Pickup Info)
    setCurrentStep(3);
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
    // Clear all booking data from storage
    clearBookingData();

    // Reset all component state to initial values
    setCurrentStep(1);
    setForceQuoteFlow(false);
    setHasAnyPricing(false);
    setPricingLoading(false);
    setIsLoadingQuote(false);
    quoteFetchedRef.current = null; // Reset quote fetch tracking

    // Reset booking data to initial state
    const initialData = {
      type: "one-way" as const,
      from: "",
      to: "",
      date: "",
      time: "",
      submittedAt: "",
      passengers: 1,
      isQuote: false, // Default to normal booking flow
      currentStep: 1,
      completedSteps: [],
    };
    setBookingData(initialData);

    // Navigate to clean /book-now URL without any parameters
    router.push("/book-now");
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
            onConvertToBooking={
              bookingData.isQuote || forceQuoteFlow
                ? handleConvertQuoteToBooking
                : undefined
            }
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
      {/* Loading state for quote fetching */}
      {isLoadingQuote && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Your Quote
            </h3>
            <p className="text-gray-600">Preparing your booking details...</p>
          </div>
        </div>
      )}

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
