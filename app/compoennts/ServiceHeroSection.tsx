"use client";

import React, { ReactNode } from "react";

interface ServicesHeroProps {
  heroImage: string;
  title: string;
  children: ReactNode; // BookingForm component
}

const ServicesHero: React.FC<ServicesHeroProps> = ({ heroImage, title, children }) => {
  return (
    <section className="relative w-full bg-white dark:bg-gray-950">
      {/* Mobile & Tablet Text Above Image */}
      <div className="lg:hidden max-w-7xl mx-auto px-6 md:px-16 pt-4 md:pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center md:text-left">
          {title}
        </h1>
      </div>

      <div className="relative mt-4 md:mt-8">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-[260px] sm:h-[320px] md:h-[400px] lg:h-[440px] xl:h-[480px] object-cover"
        />

        <div className="hidden lg:block absolute inset-0 bg-black/40"></div>

        <div className="hidden lg:flex absolute inset-0 items-center justify-between px-16 z-20">
          <h1 className="text-3xl xl:text-5xl font-bold text-white max-w-xl leading-snug drop-shadow-lg">
            {title}
          </h1>

          <div className="w-[400px] xl:w-[440px] bg-white dark:bg-gray-900 shadow-2xl rounded-xl overflow-hidden transform transition-transform duration-300 hover:-translate-y-1">
            <div className="h-full max-h-[520px]">{children}</div>
          </div>
        </div>

        <div className="block lg:hidden w-[90%] max-w-md mx-auto mt-6 mb-4 relative z-20">
          <div className="w-full bg-white dark:bg-gray-900 shadow-xl rounded-xl overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesHero;
