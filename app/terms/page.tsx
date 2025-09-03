"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-3xl mx-auto"
      >
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Noble Lane Terms of Service
          </h1>
          <p className="mt-2 text-sm text-gray-600">Effective Date: September 2025</p>
        </header>

        <article className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 leading-relaxed text-gray-800">
          <p className="mb-4">
            Welcome to Noble Lane Executive Transportation (“Noble Lane,” “we,” “our,” or “us”). By
            booking a ride, using our website, or engaging with our services, you agree to these Terms of
            Service. Please read them carefully.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">1. Services</h2>
          <p className="mb-4">
            Noble Lane provides premium executive transportation services, including airport transfers,
            hourly charters, private aviation ground coordination, and event transportation. All rides are
            subject to availability and confirmation at the time of booking.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">2. Booking &amp; Payment</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Bookings may be made through our website (www.gonoblelane.com)
            </li>
          </ul>

          {/* Additional sections can be added here as needed */}
        </article>
      </motion.div>
    </div>
  );
}

