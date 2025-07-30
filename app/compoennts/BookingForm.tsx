"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { CalendarIcon, ChevronDownIcon, TimerIcon } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns/format";

const FormSchema = z
  .object({
    type: z.enum(["one-way", "by-the-hour"]),
    from: z.string().min(2, {
      message: "Address must be at least 2 characters.",
    }),
    to: z.string().optional(),
    duration: z.string().optional(),
    date: z.date().min(new Date(), {
      message: "Date must be in the future.",
    }),
    time: z.string().min(2, {
      message: "Time must be at least 2 characters.",
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

export function BookingForm({ isModal = false }: { isModal?: boolean }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: "one-way",
      from: "",
      to: "",
      duration: "",
      date: new Date(),
      time: "",
    },
  });

  // Watch the form's type field for reactive updates
  const tripType = form.watch("type");

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Form submitted:", data);
    // toast("You submitted the following values", {
    //   description: (
    //     <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });
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
        onSubmit={form.handleSubmit(onSubmit)}
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
              "flex-1 py-2 px-4 rounded-md font-medium transition-colors",
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
              "flex-1 py-2 px-4 rounded-md font-medium transition-colors",
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
                <Input
                  className="bg-white"
                  placeholder="Address, airport, hotel, ..."
                  {...field}
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
                  <Input
                    className="bg-white"
                    placeholder="Address, airport, hotel, ..."
                    {...field}
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
                  <Input
                    className="bg-white"
                    placeholder="e.g., 2, 4, 8"
                    type="number"
                    min="1"
                    max="24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex flex-col gap-3">
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
                            " pl-3 text-left font-normal h-10 text-sm",
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
                <FormItem className="mb-4 relative">
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input
                      id="time"
                      placeholder=""
                      {...field}
                      className="bg-white border-gray-300 focus:border-primary focus:ring-primary/20"
                      type="time"
                    />
                  </FormControl>
                  <FormMessage />
                  <TimerIcon className="absolute opacity-80 right-3 top-[66%] -translate-y-1/2 h-4 w-4 text-gray-500" />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button
          type="submit"
          variant="primary-linear"
          size="lg"
          className="w-full"
        >
          Book Now <span aria-hidden="true">&rarr;</span>
        </Button>
      </form>
    </Form>
  );
}
