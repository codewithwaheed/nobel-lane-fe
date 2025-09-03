"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
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
            Noble Lane Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-600">Effective Date: September 2025</p>
        </header>

        <article className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 leading-relaxed text-gray-800">
          <p className="mb-4">
            At Noble Lane Executive Transportation (“Noble Lane,” “we,” “our,” “us”), your privacy and trust
            are important to us. This Privacy Policy explains how we collect, use, and protect your
            information when you use our website, booking platform, or related services.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
          <p>We may collect the following information when you visit our site, request a quote, or book a ride:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 mt-2">
            <li>
              <strong>Personal information:</strong> Name, email address, phone number, billing address, and payment details.
            </li>
            <li>
              <strong>Ride details:</strong> Pickup/drop-off locations, flight numbers, special requests.
            </li>
            <li>
              <strong>Device information:</strong> IP address, browser type, operating system, cookies, and analytics data.
            </li>
            <li>
              <strong>Communications:</strong> Emails, SMS, or phone interactions with our team.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 mt-2">
            <li>Process and confirm your ride reservations.</li>
            <li>Send SMS/email updates about quotes, booking confirmations, reminders, flight status, and chauffeur arrival.</li>
            <li>Provide customer support.</li>
            <li>Improve our website and services through analytics.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">3. SMS Consent and Communications</h2>
          <p>
            By providing your mobile phone number during booking or requesting a quote, you consent to receive SMS messages related to your ride, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 mt-2">
            <li>Quotes and confirmations.</li>
            <li>Chauffeur reminders and on-location alerts.</li>
            <li>Flight status or delay updates.</li>
          </ul>
          <p className="mb-4">Message frequency may vary. Msg&amp;data rates may apply.</p>
          <p className="mb-4">You can opt out at any time by replying STOP to any SMS. Reply HELP for assistance.</p>

          <h2 className="text-xl font-semibold mt-6 mb-2">4. Sharing of Information</h2>
          <p>We do not sell or rent your personal information. We may share your information only in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 mt-2">
            <li><strong>Service providers:</strong> With trusted affiliates and chauffeurs to complete your reservation.</li>
            <li><strong>Legal requirements:</strong> If required by law or to protect our rights.</li>
            <li><strong>Payment processing:</strong> With secure third-party payment processors (e.g., Stripe).</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Security</h2>
          <p className="mb-4">
            We use industry-standard safeguards, including SSL encryption, secure servers, and access controls to protect your personal data. While no system is 100% secure, we continuously monitor and improve our safeguards.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">6. Cookies and Tracking</h2>
          <p className="mb-4">
            Our website may use cookies, analytics tools, and tracking pixels to improve your browsing experience and measure performance. You can disable cookies in your browser settings, but some features may not work properly.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 mt-2">
            <li>Access, update, or delete your personal information.</li>
            <li>Opt out of marketing communications.</li>
            <li>Request details about how your data is used.</li>
          </ul>
          <p className="mb-2">To exercise these rights, contact us at <a href="mailto:privacy@gonoblelane.com" className="text-amber-600 hover:text-amber-700 font-medium">privacy@gonoblelane.com</a>.</p>
        </article>
      </motion.div>
    </div>
  );
}

