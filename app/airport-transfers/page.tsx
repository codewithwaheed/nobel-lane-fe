"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Plane,
  MapPin,
  DollarSign,
  Shield,
  Monitor,
  Car,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import ServicesHero from "../compoennts/ServiceHeroSection";
import { BookingForm } from "../compoennts/BookingForm";
import ServiceCard from "../compoennts/ServiceCard";

// Airport Transfer Features Configuration
const airportFeatures = [
  {
    icon: <Plane className="w-6 h-6 text-white" />,
    title: "DFW & Love Field Service",
    desc: "Professional airport transfer service to and from DFW International Airport and Dallas Love Field with reliable pickup and drop-off.",
  },
  {
    icon: <Monitor className="w-6 h-6 text-white" />,
    title: "Complimentary Flight Monitoring",
    desc: "Real-time flight tracking service automatically adjusts pickup times for delays, ensuring your chauffeur arrives when you land.",
  },
  {
    icon: <MapPin className="w-6 h-6 text-white" />,
    title: "Flexible Pickup Locations",
    desc: "Choose from curbside pickup, baggage claim meet-and-greet, or designated pickup areas based on your preference and needs.",
  },
  {
    icon: <DollarSign className="w-6 h-6 text-white" />,
    title: "Transparent Pricing",
    desc: "Upfront, transparent pricing with no surge fees or hidden charges. Fixed rates regardless of traffic or weather conditions.",
  },
];

// Service Spotlight Content
const serviceSpotlight = [
  {
    title: "Premium Airport Transfer Service",
    desc: `Experience stress-free airport transfers with our professional chauffeur service connecting you to DFW International and Dallas Love Field.

Our experienced drivers monitor your flight status in real-time and adjust pickup times automatically for delays or early arrivals. No more worrying about missed connections or waiting for transportation.

Every transfer includes complimentary flight monitoring, professional meet-and-greet service, and assistance with luggage. Our luxury vehicles provide comfort and reliability for business travelers and leisure guests alike.`,
    img: "/business-car.jpeg",
  },
  {
    title: "Flight Monitoring & Coordination",
    desc: `Never worry about flight delays or early arrivals with our comprehensive flight monitoring and coordination services.

Our operations center tracks your flight status from departure to arrival, automatically adjusting pickup times and notifying your chauffeur of any changes.

Whether you're arriving for business or pleasure, our professional service ensures seamless ground transportation with flexible pickup options and transparent pricing structure.`,
    img: "/contact-us.jpeg",
  },
];

// Core Airport Services
const coreServices = [
  {
    title: "DFW International Service",
    icon: <Plane className="w-6 h-6 text-white" />,
    desc: [
      "All terminals and gates coverage",
      "Domestic and international arrivals",
      "Curbside and baggage claim pickup",
      "Corporate and leisure travel service",
    ],
    cta: "Book Airport Transfer",
  },
  {
    title: "Dallas Love Field Service",
    icon: <Car className="w-6 h-6 text-white" />,
    desc: [
      "Southwest Airlines hub specialization",
      "Quick turnaround pickup service",
      "Business and leisure passenger service",
      "Flexible scheduling and booking",
    ],
    cta: "Book Airport Transfer",
  },
  {
    title: "Flight Monitoring System",
    icon: <Monitor className="w-6 h-6 text-white" />,
    desc: [
      "Real-time flight status tracking",
      "Automatic pickup time adjustments",
      "Delay and early arrival notifications",
      "24/7 operations center monitoring",
    ],
    cta: "Book Airport Transfer",
  },
  {
    title: "Professional Service Options",
    icon: <Shield className="w-6 h-6 text-white" />,
    desc: [
      "Meet-and-greet at arrivals",
      "Luggage assistance available",
      "Multiple pickup location options",
      "Transparent, no-surge pricing",
    ],
    cta: "Book Airport Transfer",
  },
];

export default function AirportTransfersPage() {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans">
      {/* Hero + Booking Form */}
      <ServicesHero
        heroImage="/hero-cover.jpeg"
        title="Airport Transfers"
        description="Professional airport transfer service to DFW International and Dallas Love Field. Complimentary flight monitoring, flexible pickup locations, and transparent pricing with no surge fees."
      >
        <BookingForm />
      </ServicesHero>

      {/* Airport Features Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {airportFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-base md:text-xl font-bold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Spotlight Sections */}
      {serviceSpotlight.map((service, index) => (
        <motion.section
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center mb-12 md:mb-16 lg:mb-24 container mx-auto px-4"
        >
          {/* Image Column */}
          <div
            className={`col-span-1 md:col-span-7 lg:col-span-6 ${
              index % 2 === 0 ? "md:order-1" : "md:order-2"
            } flex justify-center`}
          >
            <div className="relative overflow-hidden rounded-2xl group cursor-pointer w-full max-w-[650px]">
              <Image
                src={service.img}
                alt={service.title}
                width={700}
                height={500}
                className="w-full h-64 md:h-80 lg:h-[500px] object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Content Column */}
          <div
            className={`col-span-1 md:col-span-5 lg:col-span-6 ${
              index % 2 === 0 ? "md:order-2" : "md:order-1"
            }`}
          >
            <div className="text-center md:text-left max-w-xl mx-auto md:mx-0">
              <h2 className="text-xl md:text-3xl font-bold mb-4">
                {service.title}
              </h2>
              <p className="text-sm md:text-lg opacity-80 leading-relaxed whitespace-pre-line">
                {service.desc}
              </p>
            </div>
          </div>
        </motion.section>
      ))}

      {/* Core Airport Services Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-xl md:text-4xl font-bold text-center mb-12">
            Airport Transfer Services in Dallas-Fort Worth
          </h2>
          <p className="text-center max-w-3xl mx-auto text-gray-600 dark:text-gray-400 mb-16 text-base md:text-lg">
            Professional airport transfer service connecting you to DFW
            International and Dallas Love Field with flight monitoring and
            flexible pickup options.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {coreServices.map((service, index) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>

          {/* Enhanced Strategic CTA Section */}
          <div className="text-center">
            <div className="max-w-3xl md:max-w-5xl lg:max-w-6xl mx-auto mb-10 p-8 md:p-12 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-amber-100 dark:border-gray-600">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Plane className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Ready for Stress-Free Airport Transfers?
              </h3>
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
                Book your airport transfer with complimentary flight monitoring
                and professional service to DFW International and Dallas Love
                Field.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="primary-linear"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push("/book-now")}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Book Airport Transfer
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-4 text-lg font-semibold border-2 border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-gray-700 transition-all duration-300"
                  onClick={() => router.push("/book-now?type=quote")}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Get Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
