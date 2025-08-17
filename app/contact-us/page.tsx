"use client";

import Image from "next/image";
import { Phone, Mail, MapPin, Cpu } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white font-sans">
      <div className="w-full h-12 mt-1 bg-black flex items-center justify-center md:hidden">
        <h1 className="text-white text-sm font-semibold tracking-widest uppercase">
          Contact Noble Lane
        </h1>
      </div>

      {/* Hero Section */}
      <section className="relative h-[20vh] md:h-[40vh] flex items-end md:items-center text-white">
        <Image
          src="/images/Chauffeur_Opening_Car_Door_Sunset_F-1-1.webp"
          alt="Contact Noble Lane"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Desktop-only title */}
        <div className="hidden md:block relative z-10 px-6 md:px-16 max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-wide mb-4">
            Contact Noble Lane
          </h1>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-3xl">
            Ready to experience premium executive transportation? Get in touch
            with our team for immediate assistance or custom transportation
            solutions.
          </p>
        </div>
      </section>

      <div className="h-5 md:h-15" />

      {/* Contact Section */}
      <section className="py-16 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        {/* Mobile subtitle */}
        <div className="block md:hidden mb-8 text-center">
          <p className="text-base opacity-80 leading-relaxed">
            Ready to experience premium executive transportation? Get in touch
            with our team for immediate assistance or custom transportation
            solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-700">
                  <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Phone Support</h3>
                  <a
                    href="tel:+12142250105"
                    className="block text-base opacity-80 hover:text-amber-600 transition"
                  >
                    +1 (214) 225‑0105
                  </a>
                  <p className="text-sm opacity-70">
                    Standard & Booking Support
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t pt-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  24/7 Emergency Line
                </p>
                <a
                  href="tel:+12142250105"
                  className="inline-block text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 hover:underline transition"
                >
                  Available around the clock
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-700">
                  <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Email</h3>
                  <a
                    href="mailto:office@gonoblelane.com"
                    className="block text-base opacity-80 hover:text-amber-600 transition"
                  >
                    office@gonoblelane.com
                  </a>
                  <button
                    onClick={() =>
                      window.open(
                        "mailto:office@gonoblelane.com?subject=Request%20Zoom%20Meeting"
                      )
                    }
                    className="mt-1 text-sm text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Request Zoom Meeting
                  </button>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-700">
                  <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Office Address</h3>
                  <p className="text-base opacity-80">
                    4245 N Central Expressway, #490
                    <br /> Dallas, TX 75205
                  </p>
                  <p className="text-sm opacity-70 mt-1">
                    Office hours vary, but we&apos;re open until the last
                    passenger is onboard
                  </p>
                </div>
              </div>
            </div>

            {/* AI Coordination */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-700">
                  <Cpu className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    AI Coordination
                  </h3>
                  <p className="text-base opacity-80">
                    24/7 AI-powered scheduling for seamless VIP travel & instant
                    updates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-72 md:h-[400px] bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900">
            <iframe
              src="https://maps.google.com/maps?q=4245%20N%20Central%20Expressway%20Dallas%20TX&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full filter brightness-[0.85] contrast-[1.1] sepia-[0.15] saturate-[0.9] hue-rotate-[15deg]"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  );
}
