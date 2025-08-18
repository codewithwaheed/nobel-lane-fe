"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { BookingFormData } from "@/lib/booking-storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns/format";
import AddressAutocomplete from "./AddressAutocomplete";

const FormSchema = z
  .object({
    type: z.enum(["one-way", "by-the-hour"]),
    from: z.string().min(2, {
      message: "Address must be at least 2 characters.",
    }),
    fromZipcode: z.string().optional(), // Add ZIP code field
    to: z.string().optional(),
    toZipcode: z.string().optional(), // Add ZIP code field
    duration: z.string().optional(),
    date: z.date().min(new Date().setHours(0, 0, 0, 0), {
      message: "Date must be in the future.",
    }),
    time: z.string().min(1, {
      message: "Time is required.",
    }),
  })
  .superRefine((data, ctx) => {
    // For one-way trips, "to" field is required
    if (data.type === "one-way" && (!data.to || data.to.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Destination address is required for one-way trips.",
        path: ["to"],
      });
    }
    // For hourly trips, "duration" field is required
    if (
      data.type === "by-the-hour" &&
      (!data.duration || data.duration.length < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duration is required for hourly bookings.",
        path: ["duration"],
      });
    }
  });

// Time slots array - same as TripDetails
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

// Duration options - same as TripDetails
const durationOptions = Array.from({ length: 24 }, (_, i) => i + 1);
const today = new Date();
today.setHours(0, 0, 0, 0);
const defaultDate = new Date(today);
defaultDate.setDate(defaultDate.getDate() + 1);
export function BookingForm({ isModal = false }: { isModal?: boolean }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: "one-way",
      from: "",
      fromZipcode: "",
      to: "",
      toZipcode: "",
      duration: "",
      date: defaultDate,
      time: "",
    },
  });

  // Watch the form's type field for reactive updates
  const tripType = form.watch("type");

  // Handle form submission for both Get Quote and Book Now
  function handleFormSubmission(actionType: "quote" | "book-now") {
    return (data: z.infer<typeof FormSchema>) => {
      console.log(`${actionType} submitted:`, data);

      // Transform data to match BookingFormData interface
      const bookingData: Omit<BookingFormData, "submittedAt" | "date"> & {
        date: Date;
      } = {
        ...data,
        isQuote: actionType === "quote",
        passengers: 1, // Default value
        currentStep: 1, // Starting step
        completedSteps: [], // No steps completed yet
      };

      console.log("Form submitted with data:", bookingData);

      // Create URL parameters to pass the form data
      const urlParams = new URLSearchParams();

      // Add basic flow type
      if (actionType === "quote") {
        urlParams.set("type", "quote");
      }

      // Add form data as URL parameters
      urlParams.set("tripType", data.type);
      urlParams.set("from", data.from);
      urlParams.set("fromZipcode", data.fromZipcode || "");

      if (data.to) {
        urlParams.set("to", data.to);
        urlParams.set("toZipcode", data.toZipcode || "");
      }

      if (data.duration) {
        urlParams.set("duration", data.duration);
      }

      urlParams.set("date", format(data.date, "yyyy-MM-dd"));
      urlParams.set("time", data.time);
      urlParams.set("prefilled", "true"); // Flag to indicate data is pre-filled

      // Navigate with the form data as URL parameters
      const targetUrl = `/book-now?${urlParams.toString()}`;
      console.log("Navigating to:", targetUrl);
      router.push(targetUrl);
    };
  }

  return (
    <Form {...form}>
      <form
        className={cn(
          "w-full max-w-md bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 lg:p-8",
          isModal
            ? "min-h-full rounded-none shadow-none p-2 backdrop-blur-none bg-transparent pt-10"
            : ""
        )}
      >
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          Book Your Ride
        </h3>

        {/* Trip Type Selection */}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => {
              form.setValue("type", "one-way");
              // Clear duration field when switching to one-way
              form.setValue("duration", "");
            }}
            className={cn(
              "flex-1 py-2 px-4 rounded-md font-medium transition-colors cursor-pointer",
              tripType === "one-way"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            One Way
          </button>
          <button
            type="button"
            onClick={() => {
              form.setValue("type", "by-the-hour");
              // Clear to field when switching to hourly
              form.setValue("to", "");
            }}
            className={cn(
              "flex-1 py-2 px-4 rounded-md font-medium transition-colors cursor-pointer",
              tripType === "by-the-hour"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            By the Hour
          </button>
        </div>
        <FormField
          control={form.control}
          name="from"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>From</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  id="from"
                  value={field.value}
                  placeholder="Address, airport, hotel, ..."
                  onChange={field.onChange}
                  onSelect={(placeDetails) => {
                    field.onChange(placeDetails.formatted_address);
                    // Store ZIP code for pricing API - same as TripDetails
                    if (placeDetails.zipcode) {
                      form.setValue("fromZipcode", placeDetails.zipcode);
                    }
                  }}
                  className="bg-white h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditionally show "To" field only for one-way trips */}
        {tripType === "one-way" && (
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>To</FormLabel>
                <FormControl>
                  <AddressAutocomplete
                    id="to"
                    value={field.value || ""}
                    placeholder="Address, airport, hotel, ..."
                    onChange={field.onChange}
                    onSelect={(placeDetails) => {
                      field.onChange(placeDetails.formatted_address);
                      // Store ZIP code for pricing API - same as TripDetails
                      if (placeDetails.zipcode) {
                        form.setValue("toZipcode", placeDetails.zipcode);
                      }
                    }}
                    className="bg-white h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Show duration field for hourly bookings */}
        {tripType === "by-the-hour" && (
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Duration (Hours)</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white h-10 w-full">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((hour) => (
                        <SelectItem key={hour} value={hour.toString()}>
                          {hour} {hour === 1 ? "hour" : "hours"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-[2] flex flex-col gap-3">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal h-10 text-sm",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white h-10 text-sm font-normal text-left">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            className="w-full font-bold"
            variant="outline"
            onClick={form.handleSubmit(handleFormSubmission("quote"))}
          >
            Get Quote
          </Button>
          <Button
            type="button"
            variant="primary-linear"
            size="lg"
            className="w-full font-bold"
            onClick={form.handleSubmit(handleFormSubmission("book-now"))}
          >
            Book Now <span aria-hidden="true">&rarr;</span>
          </Button>
        </div>
      </form>
    </Form>
  );
}
