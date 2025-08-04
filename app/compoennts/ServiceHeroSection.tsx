"use client";

import React, { ReactNode } from "react";
import Image from "next/image";

interface ServicesHeroProps {
  heroImage: string;
  title: string;
  description?: string;
  children: ReactNode; // BookingForm component
}

const ServicesHero: React.FC<ServicesHeroProps> = ({
  heroImage,
  title,
  description,
  children,
}) => {
  return (
    <section className="relative w-full bg-white dark:bg-gray-950">
      {/* Mobile & Tablet Header - Title Only */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
        </div>
      </div>

      <div className="relative mt-2 md:mt-0">
        <Image
          src={heroImage}
          alt="Hero"
          width={1920}
          height={480}
          className="w-full h-[300px] sm:h-[360px] md:h-[440px] lg:h-[500px] xl:h-[560px] object-cover"
          priority
        />

        {/* Mobile Description Overlay */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 flex items-center justify-center">
          <div className="p-4 md:p-6 text-center mt-2">
            {description && (
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 md:p-6">
                <p className="text-xs md:text-sm text-white leading-relaxed max-w-2xl drop-shadow-2xl font-medium">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dark overlay for desktop */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>

        {/* Desktop Content */}
        <div className="hidden lg:flex absolute inset-0 items-center justify-between px-8 xl:px-16 z-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl xl:text-5xl font-bold text-white leading-tight drop-shadow-lg mb-4">
              {title}
            </h1>
            {description && (
              <p className="text-lg xl:text-xl text-white/90 leading-relaxed drop-shadow-md max-w-xl">
                {description}
              </p>
            )}
          </div>

          <div className="w-[420px] xl:w-[460px] bg-white dark:bg-gray-900 shadow-2xl rounded-xl overflow-hidden transform transition-transform duration-300 hover:-translate-y-1">
            <div className="h-full min-h-[520px] max-h-[600px] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Booking Form - Increased Height */}
      <div className="block lg:hidden w-[92%] max-w-lg mx-auto -mt-16 sm:-mt-20 md:-mt-24 mb-8 relative z-20">
        <div className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-xl overflow-hidden">
          <div className="min-h-[580px] sm:min-h-[620px] md:min-h-[650px] max-h-none">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesHero;
