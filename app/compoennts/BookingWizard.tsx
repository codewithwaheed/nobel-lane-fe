"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import WizardProgress from "./WizardProgress";
import TripDetails from "./TripDetails";
import VehicleSelection from "./VehicleSelection";
import AdditionalInfo from "./AdditionalInfo";
import Payment from "./Payment";
import Confirmation from "./Confirmation";
import {
  getBookingData,
  updateBookingData,
  clearBookingData,
} from "@/lib/booking-storage";
import type { BookingFormData, VehicleOption } from "@/lib/booking-storage";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LoginForm } from "./LoginForm";

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

export default function BookingWizard({ onClose }: BookingWizardProps) {
  const [bookingData, setBookingData] = useState<BookingFormData>(() => {
    const saved = getBookingData();
    return (
      saved || {
        type: "one-way",
        from: "",
        to: "",
        date: "",
        time: "",
        submittedAt: "",
        passengers: 1,
        isQuote: false, // Default to normal booking flow, not quote
        currentStep: 1,
        completedSteps: [],
      }
    );
  });

  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = getBookingData();
    if (saved && saved.from && saved.date && saved.time) return 2; // jump to Service if details exist
    return 1;
  });

  // Pricing status bubbled up from VehicleSelection
  const [pricingLoading, setPricingLoading] = useState(false);
  const [hasAnyPricing, setHasAnyPricing] = useState(false);
  const [forceQuoteFlow, setForceQuoteFlow] = useState(false);

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

  // Persist booking data
  useEffect(() => {
    updateBookingData(bookingData);
  }, [bookingData]);

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
    if (currentStepName === "Service") {
      if (hasAnyPricing && !pricingLoading) {
        // Pricing is available - ensure we're in booking flow
        if (forceQuoteFlow) {
          setForceQuoteFlow(false);
          updateBookingDataState({ isQuote: false });
        }
      } else if (!pricingLoading && !hasAnyPricing) {
        // No pricing available - switch to quote flow
        if (!bookingData.isQuote && !forceQuoteFlow) {
          setForceQuoteFlow(true);
          updateBookingDataState({ isQuote: true });
        }
      }
    }
  }, [
    currentStepName,
    hasAnyPricing,
    pricingLoading,
    bookingData.isQuote,
    forceQuoteFlow,
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
        return (
          <VehicleSelection
            selectedVehicle={bookingData.selectedVehicle}
            onVehicleSelect={handleVehicleSelect}
            showPricing={true} // Always show pricing UI, but VehicleSelection will handle display logic
            isQuoteFlow={bookingData.isQuote || forceQuoteFlow}
            onNext={handleNext}
            onPrevious={handleBack}
            canGoNext={!!bookingData.selectedVehicle}
            canGoPrevious={currentStep > 1}
            onPricingStatus={(s) => {
              setPricingLoading(s.loading);
              setHasAnyPricing(s.hasAnyPricing);
            }}
            tripData={{
              type: bookingData.type,
              fromZipcode: bookingData.fromZipcode,
              toZipcode: bookingData.toZipcode,
              duration: bookingData.duration,
            }}
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
          <Confirmation
            isQuote={bookingData.isQuote || forceQuoteFlow}
            bookingData={bookingData}
            onStartNew={handleStartNew}
          />
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
        onBack={onClose}
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
