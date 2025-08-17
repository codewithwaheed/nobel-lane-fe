"use client";

import { useState, useEffect } from "react";
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
import { LoginForm } from "@/app/login/page";

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
        isQuote: isQuote,
        currentStep: 1,
        completedSteps: [],
      }
    );
  });

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    // Initial fetch
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Determine starting step based on existing data
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = getBookingData();
    if (saved && saved.from && saved.date && saved.time) {
      // If we have trip details, start from vehicle selection
      return 2;
    }
    return 1; // Otherwise start from trip details
  });

  // Build steps dynamically: insert Sign In before Payment when not logged in (booking flow only)
  const derivedSteps = isQuote
    ? quoteSteps
    : user
    ? steps
    : [
        { id: 1, name: "Trip Details", description: "Where and when" },
        { id: 2, name: "Service", description: "Choose your ride" },
        { id: 3, name: "Pickup Info", description: "Additional information" },
        { id: 4, name: "Sign In", description: "Access your account" },
        { id: 5, name: "Payment", description: "Secure checkout" },
        { id: 6, name: "Confirmation", description: "All set!" },
      ];

  const maxStep = derivedSteps.length;
  const currentStepName = derivedSteps[currentStep - 1]?.name;

  // Save data whenever it changes
  useEffect(() => {
    updateBookingData(bookingData);
  }, [bookingData]);

  const updateBookingDataState = (updates: Partial<BookingFormData>) => {
    setBookingData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTripDetailsSubmit = (data: Partial<BookingFormData>) => {
    updateBookingDataState(data);
    handleNext();
  };

  const handleVehicleSelect = (vehicle: VehicleOption) => {
    updateBookingDataState({ selectedVehicle: vehicle });
    // Don't automatically go to next step - let user use action buttons
  };

  const handleAdditionalInfoSubmit = (data: Partial<BookingFormData>) => {
    updateBookingDataState(data);
    if (isQuote) {
      // For quotes, skip payment and go straight to confirmation
      setCurrentStep(4);
    } else {
      handleNext();
    }
  };

  const handlePaymentComplete = () => {
    handleNext();
  };

  const handleStartNew = () => {
    clearBookingData();
    setCurrentStep(1);
    const fresh = getBookingData();
    if (fresh) {
      setBookingData(fresh);
    } else {
      setBookingData({
        type: "one-way",
        from: "",
        to: "",
        date: "",
        time: "",
        submittedAt: "",
        passengers: 1,
        isQuote: isQuote,
        currentStep: 1,
        completedSteps: [],
      });
    }
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
        return true; // Booking flow doesn't require additional info
      case "Sign In":
        return false; // Controlled by LoginForm submit
      case "Payment":
      default:
        return true; // Payment validation handled in component
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
            showPricing={!isQuote}
            onNext={handleNext}
            onPrevious={handleBack}
            canGoNext={!!bookingData.selectedVehicle}
            canGoPrevious={currentStep > 1}
            tripData={{
              type: bookingData.type,
              fromPlaceId: bookingData.fromPlaceId,
              toPlaceId: bookingData.toPlaceId,
              fromLat: bookingData.fromLat,
              fromLng: bookingData.fromLng,
              toLat: bookingData.toLat,
              toLng: bookingData.toLng,
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
            isQuote={isQuote}
            bookingData={bookingData}
            user={user}
            onSubmit={handleAdditionalInfoSubmit}
            onBack={handleBack}
          />
        );
      case "Sign In":
        return (
          <div className="max-w-md mx-auto">
            <LoginForm
              showTitle={false}
              className="mt-0 md:mt-0 lg:mt-0"
              onSuccess={(u) => {
                // Update local user state; step will auto-advance via effect
                setUser(u as User);
              }}
            />
          </div>
        );
      case "Payment":
        if (isQuote) {
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
            user={user}
            onPaymentComplete={handlePaymentComplete}
            onBack={handleBack}
          />
        );
      case "Confirmation":
        return (
          <Confirmation
            isQuote={!!isQuote}
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
      {/* Merged Header + Progress */}
      <WizardProgress
        steps={derivedSteps}
        currentStep={currentStep}
        title={isQuote ? "Request Quote" : "Book Your Trip"}
        onBack={onClose}
      />

      {/* Content */}
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
