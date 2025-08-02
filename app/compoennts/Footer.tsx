"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useBooking } from "../contexts/BookingContext";

export default function Footer() {
  const { setIsBookingModalOpen } = useBooking();
  return (
    <footer className="bg-gray-800 dark:bg-gray-900">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link
            href="/"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
          >
            <Image
              src="/logo.png"
              alt="Noble Lane Logo"
              width={200}
              height={80}
              className="brightness-0 invert"
            />
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-300 sm:mb-0">
            <li>
              <a href="#" className="hover:text-yellow-400 me-4 md:me-6">
                Service
              </a>
            </li>
            <li>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="hover:text-yellow-400 me-4 md:me-6 bg-transparent border-none text-sm font-medium text-gray-300 cursor-pointer"
              >
                Book Now
              </button>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-yellow-400 me-4 md:me-6"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact-us"
                className="hover:text-yellow-400 me-4 md:me-6"
              >
                Contact
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="hover:text-yellow-400 bg-transparent border-none text-sm font-medium text-gray-300 cursor-pointer"
              >
                Get Quote
              </button>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-600 sm:mx-auto lg:my-8" />
        <span className="block text-sm text-gray-400 sm:text-center">
          © 2025{" "}
          <Link href="/" className="hover:text-yellow-400 font-semibold">
            Nobel Lane™
          </Link>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
