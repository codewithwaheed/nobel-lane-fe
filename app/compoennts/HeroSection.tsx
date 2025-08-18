"use client";
import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useBooking } from "../contexts/BookingContext";

import { BookingForm } from "./BookingForm";
export default function HeroSection() {
  const { setIsBookingModalOpen } = useBooking();
  return (
    <div
      className="min-h-[550px] md:min-h-[650px] bg-cover bg-center bg-no-repeat relative"
      // style={{
      //   backgroundImage:
      //     "url('/images/noble-lane-executive-airport-transportF.webp')",
      // }}
    >
      <Image
        src="/images/noble-lane-executive-airport-transportF.webp"
        alt="Noble Lane luxury vehicles at Dallas airport"
        fill
        priority
        style={{
          objectFit: "cover",
        }}
        sizes="100vw"
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[550px] md:min-h-[650px]">
        {/* Left Content - 50% width on large screens */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="max-w-xl w-full text-center lg:text-left">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-white leading-tight">
              <span className="md:bg-primary-linear text-nowrap text-primary-foreground px-2 py-1 mr-2 rounded-md">
                Premium Executive
              </span>
              <br className="sm:block" />
              Car Service in Dallas-Fort Worth
            </h1>
            <p className="text-md lg:text-2xl md:text-xl text-gray-200 leading-relaxed">
              AI-powered luxury transportation with professional chauffeurs.
              Experience the future of executive ground transportation in DFW.
            </p>

            <Button
              variant="primary-linear"
              size="lg"
              className="font-semibold w-[200px] mt-10 md:hidden"
              onClick={() => setIsBookingModalOpen(true)}
            >
              Book Now <span aria-hidden="true">&rarr;</span>
            </Button>
          </div>
        </div>

        {/* Right Content - 50% width on large screens */}
        <div className=" hidden flex-1 md:flex items-center justify-center p-6 lg:p-12">
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
