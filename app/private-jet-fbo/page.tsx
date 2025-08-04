"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ExecutiveTransportationPage() {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white font-sans">
      <section className="container mx-auto px-4 py-12 md:py-24 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Executive Transportation
        </h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto mb-6">
          Premium executive transportation services for VIPs, corporate leaders, 
          and private clients in the Dallas-Fort Worth area.
        </p>
        <button
          onClick={() => router.push("/book-now")}
          className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          Book Now
        </button>
      </section>
    </main>
  );
}
