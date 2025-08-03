"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BookingFormData } from "@/lib/booking-storage";

interface TripDetailsProps {
  bookingData: BookingFormData;
  onSubmit: (data: Partial<BookingFormData>) => void;
}

export default function TripDetails({
  bookingData,
  onSubmit,
}: TripDetailsProps) {
  const [formData, setFormData] = useState({
    type: bookingData.type || "one-way",
    from: bookingData.from || "",
    to: bookingData.to || "",
    duration: bookingData.duration || "",
    date: bookingData.date || "",
    time: bookingData.time || "",
    passengers: bookingData.passengers || 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.from.trim()) {
      newErrors.from = "Pickup location is required";
    }

    if (formData.type === "one-way" && !formData.to.trim()) {
      newErrors.to = "Destination is required for one-way trips";
    }

    if (formData.type === "by-the-hour" && !formData.duration) {
      newErrors.duration = "Duration is required for hourly bookings";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const timeSlots = [
    "12:00 AM",
    "12:30 AM",
    "1:00 AM",
    "1:30 AM",
    "2:00 AM",
    "2:30 AM",
    "3:00 AM",
    "3:30 AM",
    "4:00 AM",
    "4:30 AM",
    "5:00 AM",
    "5:30 AM",
    "6:00 AM",
    "6:30 AM",
    "7:00 AM",
    "7:30 AM",
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
    "9:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
    "11:30 PM",
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          Trip Details
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">
              Service Type
            </Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  handleChange("type", "one-way");
                  handleChange("duration", "");
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  formData.type === "one-way"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                One Way
              </button>
              <button
                type="button"
                onClick={() => {
                  handleChange("type", "by-the-hour");
                  handleChange("to", "");
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  formData.type === "by-the-hour"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                By the Hour
              </button>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="from" className="text-sm font-medium">
                From
              </Label>
              <Input
                id="from"
                type="text"
                placeholder="Address, airport, hotel, ..."
                value={formData.from}
                onChange={(e) => handleChange("from", e.target.value)}
                className={`mt-1 ${errors.from ? "border-red-500" : ""}`}
              />
              {errors.from && (
                <p className="text-sm text-red-500 mt-1">{errors.from}</p>
              )}
            </div>

            {formData.type === "one-way" && (
              <div>
                <Label htmlFor="to" className="text-sm font-medium">
                  To
                </Label>
                <Input
                  id="to"
                  type="text"
                  placeholder="Address, airport, hotel, ..."
                  value={formData.to}
                  onChange={(e) => handleChange("to", e.target.value)}
                  className={`mt-1 ${errors.to ? "border-red-500" : ""}`}
                />
                {errors.to && (
                  <p className="text-sm text-red-500 mt-1">{errors.to}</p>
                )}
              </div>
            )}

            {formData.type === "by-the-hour" && (
              <div>
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration
                </Label>
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  className={`mt-1 w-full p-2 border rounded-md ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select duration</option>
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="5">5 hours</option>
                  <option value="6">6 hours</option>
                  <option value="8">8 hours</option>
                  <option value="10">10 hours</option>
                  <option value="12">12 hours</option>
                </select>
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
                )}
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={`mt-1 ${errors.date ? "border-red-500" : ""}`}
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <Label htmlFor="time" className="text-sm font-medium">
                Time
              </Label>
              <select
                id="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className={`mt-1 w-full p-2 border rounded-md ${
                  errors.time ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && (
                <p className="text-sm text-red-500 mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Passengers */}
          <div>
            <Label className="text-sm font-medium">Number of Passengers</Label>
            <div className="flex items-center gap-4 mt-2">
              <button
                type="button"
                onClick={() =>
                  handleChange(
                    "passengers",
                    Math.max(1, formData.passengers - 1)
                  )
                }
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="text-lg font-medium w-8 text-center">
                {formData.passengers}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleChange(
                    "passengers",
                    Math.min(8, formData.passengers + 1)
                  )
                }
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-md"
          >
            Continue to Vehicle Selection
          </Button>
        </form>
      </div>
    </div>
  );
}
