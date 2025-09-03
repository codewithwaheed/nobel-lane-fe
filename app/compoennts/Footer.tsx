"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useBooking } from "../contexts/BookingContext";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Music, // TikTok icon alternative
} from "lucide-react";

export default function Footer() {
  const { setIsBookingModalOpen } = useBooking();
  return (
    <footer className="bg-gray-800 dark:bg-gray-900" role="contentinfo">
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
              <Link href="#" className="hover:text-yellow-400 me-4 md:me-6">
                City Guide
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-yellow-400 me-4 md:me-6">
                World Cup
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

        {/* Social Media Links */}
        <div className="flex justify-center space-x-6 mb-6">
          <a
            href="https://www.facebook.com/profile.php?id=61579230786610"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
            aria-label="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="https://www.instagram.com/gonoblelane5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://x.com/NobleLane89508"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
            aria-label="X (Twitter)"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/company/noble-lane-executive-transport"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a
            href="https://www.tiktok.com/@nooblelane"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
            aria-label="TikTok"
          >
            <Music className="w-5 h-5" />
          </a>
        </div>

        <hr className="my-6 border-gray-600 sm:mx-auto lg:my-8" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="block text-sm text-gray-400">
            © 2025{" "}
            <Link href="/" className="hover:text-yellow-400 font-semibold">
              Nobel Lane™
            </Link>
            . All Rights Reserved.
          </span>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link href="/terms" className="hover:text-yellow-400">
              Terms of Service
            </Link>
            <span className="text-gray-500">|</span>
            <Link href="/privacy" className="hover:text-yellow-400">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
