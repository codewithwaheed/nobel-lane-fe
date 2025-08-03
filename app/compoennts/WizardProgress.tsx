"use client";

import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  id: number;
  name: string;
  description: string;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
  title: string;
  onBack: () => void;
}

export default function WizardProgress({
  steps,
  currentStep,
  title,
  onBack,
}: WizardProgressProps) {
  const currentStepData = steps.find((step) => step.id === currentStep);

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout - Header + Progress */}
        <div className="hidden md:block py-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to site
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step.id < currentStep
                        ? "bg-amber-500 text-white"
                        : step.id === currentStep
                        ? "bg-amber-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3">
                    <div
                      className={`text-sm font-medium ${
                        step.id <= currentStep
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div
                      className={`h-0.5 ${
                        step.id < currentStep ? "bg-amber-500" : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Layout - Current Step + Mini Progress */}
        <div className="md:hidden py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              size="sm"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="text-sm font-medium text-gray-900">{title}</div>
            <div className="text-xs text-gray-500">
              {currentStep}/{steps.length}
            </div>
          </div>

          {/* Current Step Display */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-semibold mr-3">
                {currentStep}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {currentStepData?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {currentStepData?.description}
                </div>
              </div>
            </div>
          </div>

          {/* Mini Progress Dots */}
          <div className="flex items-center justify-center space-x-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  step.id < currentStep
                    ? "bg-green-500"
                    : step.id === currentStep
                    ? "bg-amber-500"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
