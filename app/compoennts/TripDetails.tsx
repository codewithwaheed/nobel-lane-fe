"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns/format";
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
    date: bookingData.date ? new Date(bookingData.date) : null,
    time: bookingData.time || "",
    passengers: bookingData.passengers || 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    field: string,
    value: string | number | Date | null | undefined
  ) => {
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
      const submissionData = {
        ...formData,
        date: formData.date ? formData.date.toISOString().split("T")[0] : "",
      };
      onSubmit(submissionData);
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

  const durationOptions = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          Trip Details
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type Selection */}
          <div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  handleChange("type", "one-way");
                  handleChange("duration", "");
                }}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
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
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
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
                className={`mt-1 h-11 ${errors.from ? "border-red-500" : ""}`}
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
                  className={`mt-1 h-11 ${errors.to ? "border-red-500" : ""}`}
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
                <Select
                  value={formData.duration}
                  onValueChange={(value) => handleChange("duration", value)}
                >
                  <SelectTrigger
                    className={`mt-1 !h-11 w-full ${
                      errors.duration ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent
                    className="w-full"
                    position="popper"
                    sideOffset={4}
                  >
                    {durationOptions.map((hour) => (
                      <SelectItem
                        key={hour}
                        value={hour.toString()}
                        className="w-full hover:bg-gray-100 focus:bg-gray-100 data-[highlighted]:bg-gray-100"
                      >
                        {hour} {hour === 1 ? "hour" : "hours"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
                )}
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mt-1 h-11 w-full pl-3 text-left font-normal",
                      !formData.date && "text-muted-foreground",
                      errors.date && "border-red-500"
                    )}
                  >
                    {formData.date ? (
                      format(formData.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date || undefined}
                    onSelect={(date) => handleChange("date", date)}
                    disabled={(date) => date < new Date()}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <Label htmlFor="time" className="text-sm font-medium">
                Time
              </Label>
              <Select
                value={formData.time}
                onValueChange={(value) => handleChange("time", value)}
              >
                <SelectTrigger
                  className={`mt-1 !h-11 w-full ${
                    errors.time ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent
                  className="w-full"
                  position="popper"
                  sideOffset={4}
                >
                  {timeSlots.map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      className="w-full hover:bg-gray-100 focus:bg-gray-100 data-[highlighted]:bg-gray-100"
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
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
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-md transition-colors"
          >
            Continue to Service
          </Button>
        </form>
      </div>
    </div>
  );
}
