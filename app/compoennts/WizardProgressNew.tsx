"use client";

import { Check } from "lucide-react";

interface Step {
  id: number;
  name: string;
  description: string;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
}

export default function WizardProgress({
  steps,
  currentStep,
}: WizardProgressProps) {
  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden md:block">
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
                      step.id <= currentStep ? "text-gray-900" : "text-gray-500"
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

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center mb-4">
          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center p-3 rounded-lg ${
                step.id === currentStep
                  ? "bg-amber-50 border border-amber-200"
                  : step.id < currentStep
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  step.id < currentStep
                    ? "bg-green-500 text-white"
                    : step.id === currentStep
                    ? "bg-amber-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step.id < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <div>
                <div
                  className={`text-sm font-medium ${
                    step.id <= currentStep ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
