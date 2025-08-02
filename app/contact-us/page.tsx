"use client";

import { useState } from "react";
import Header from "../compoennts/Header";
import Footer from "../compoennts/Footer";
import Image from "next/image";
import { Phone, Mail, MapPin, Cpu } from "lucide-react";

export default function ContactPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <>
      <Header setIsBookingModalOpen={setIsBookingModalOpen} />

      <main className="bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white font-sans">

        <div className="w-full h-12 mt-1 mb-7 bg-black flex items-center justify-center md:hidden">
  <h1 className="text-white text-sm font-semibold tracking-widest uppercase">
    Contact Us
  </h1>
</div>


        {/* Hero Section */}
        <section className="relative h-[30vh] md:h-[35vh] flex items-end md:items-center text-white">
          <Image
            src="/hero-cover.jpeg"
            alt="Contact Noble Lane"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />

          {/* Desktop-only title */}
          <div className="hidden md:block relative z-10 px-6 md:px-16 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold tracking-wide">
              Contact Us
            </h1>
          </div>
        </section>

        <div className="h-5 md:h-15" />

        {/* Contact Section */}
        <section className="py-16 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-full">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Phone Support</h3>
                    <a href="tel:+12142250105" className="block text-base opacity-80 hover:text-blue-600 transition">
                      +1 (214) 225‑0105
                    </a>
                    <p className="text-sm opacity-70">Standard & Booking Support</p>
                  </div>
                </div>

                <div className="mt-4 border-t pt-3">
                  <p className="text-sm font-medium text-red-600 mb-1">Emergency 24/7 Line</p>
                  <a
                    href="tel:+12142250105"
                    className="inline-block text-sm text-red-600 hover:underline"
                  >
                    🚨 Call Immediately
                  </a>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-full">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Email</h3>
                    <a href="mailto:info@gonoblelane.com" className="block text-base opacity-80 hover:text-blue-600 transition">
                      info@gonoblelane.com
                    </a>
                    <button
                      onClick={() =>
                        window.open(
                          "mailto:info@gonoblelane.com?subject=Request%20Zoom%20Meeting"
                        )
                      }
                      className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Request Zoom Meeting
                    </button>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-full">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Office Address</h3>
                    <p className="text-base opacity-80">
                      4245 N Central Expressway, #490
                      <br /> Dallas, TX 75205
                    </p>
                    <p className="text-sm opacity-70 mt-1">Office Hours: 9 AM – 6 PM (Mon-Fri)</p>
                  </div>
                </div>
              </div>

              {/* AI Coordination */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-full">
                    <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">AI Coordination</h3>
                    <p className="text-base opacity-80">
                      24/7 AI-powered scheduling for seamless VIP travel & instant updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Map */}
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-72 md:h-[400px]">
              <iframe
                src="https://maps.google.com/maps?q=4245%20N%20Central%20Expressway%20Dallas%20TX&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}





