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

  // Determine starting step based on existing data
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = getBookingData();
    if (saved && saved.from && saved.date && saved.time) {
      // If we have trip details, start from vehicle selection
      return 2;
    }
    return 1; // Otherwise start from trip details
  });

  const currentSteps = isQuote ? quoteSteps : steps;
  const maxStep = isQuote ? 4 : 5;

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
    switch (currentStep) {
      case 1:
        return !!(bookingData.from && bookingData.date && bookingData.time);
      case 2:
        return !!bookingData.selectedVehicle;
      case 3:
        if (isQuote) {
          return !!(bookingData.phone || bookingData.email);
        }
        return true; // Booking flow doesn't require additional info
      case 4:
        return true; // Payment validation handled in component
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TripDetails
            bookingData={bookingData}
            onSubmit={handleTripDetailsSubmit}
          />
        );
      case 2:
        return (
          <VehicleSelection
            selectedVehicle={bookingData.selectedVehicle}
            onVehicleSelect={handleVehicleSelect}
            showPricing={!isQuote}
            onNext={handleNext}
            onPrevious={handleBack}
            canGoNext={!!bookingData.selectedVehicle}
            canGoPrevious={currentStep > 1}
          />
        );
      case 3:
        return (
          <AdditionalInfo
            isQuote={isQuote}
            bookingData={bookingData}
            onSubmit={handleAdditionalInfoSubmit}
            onBack={handleBack}
          />
        );
      case 4:
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
            onPaymentComplete={handlePaymentComplete}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <Confirmation
            isQuote={false}
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
        steps={currentSteps}
        currentStep={currentStep}
        title={isQuote ? "Request Quote" : "Book Your Trip"}
        onBack={onClose}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-8 sm:mb-12">
        {renderStepContent()}
      </div>

      {currentStep === 2 && !bookingData.selectedVehicle && (
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
