"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Users,
  Bus,
  Calendar,
  UserCheck,
  MapPin,
  Building,
  Stethoscope,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import ServicesHero from "../compoennts/ServiceHeroSection";
import { BookingForm } from "../compoennts/BookingForm";
import ServiceCard from "../compoennts/ServiceCard";

// Group Transportation Features Configuration
const groupFeatures = [
  {
    icon: <Bus className="w-6 h-6 text-white" />,
    title: "Multi-Vehicle Fleet Options",
    desc: "Individual transfers, Sprinter-style vans, mini buses, and coach buses available to accommodate groups of any size from 1 to 50+ passengers.",
  },
  {
    icon: <Calendar className="w-6 h-6 text-white" />,
    title: "Multi-Vehicle Coordination",
    desc: "Professional coordination of multiple vehicles for large events, ensuring synchronized arrivals and departures for complex group logistics.",
  },
  {
    icon: <Building className="w-6 h-6 text-white" />,
    title: "Corporate Events & Conferences",
    desc: "Specialized transportation services for corporate events, conferences, and business gatherings with reliable scheduling and professional service.",
  },
  {
    icon: <UserCheck className="w-6 h-6 text-white" />,
    title: "Meet & Greet Service",
    desc: "Professional meet-and-greet service available for groups, with assistance for luggage handling and coordination of passenger movements.",
  },
];

// Service Spotlight Content
const serviceSpotlight = [
  {
    title: "Large Group Transportation Solutions",
    desc: `Streamline your group transportation needs with our comprehensive fleet and professional coordination services for events of any size.

From intimate executive groups to large corporate conferences, we provide the right vehicle for every occasion. Our fleet includes luxury sedans, Sprinter vans, mini buses, and full-size coach buses to accommodate any group size.

Our experienced logistics team coordinates multiple vehicles, manages complex itineraries, and ensures all passengers arrive on time and together. Perfect for corporate events, conferences, and special occasions.`,
    img: "/images/Noble_Lane_Fleet_F.webp",
  },
  {
    title: "Corporate Events & Speaker Transportation",
    desc: `Specialized group transportation services for corporate events, conferences, and speaker transportation with professional coordination.

We understand the unique requirements of corporate gatherings and professional events, providing reliable transportation that reflects your organization's professionalism.

Our services include speaker transportation, attendee shuttles, multi-venue coordination, and flexible scheduling to accommodate last-minute changes or extended event schedules.`,
    img: "/images/Chauffeur_Opening_Car_Door_Sunset_F-1-1.webp",
  },
];

// Core Group Services
const coreServices = [
  {
    title: "Individual & Small Groups",
    icon: <Users className="w-6 h-6 text-white" />,
    desc: [
      "Luxury sedans and SUVs for 1-6 passengers",
      "Sprinter-style vans for 7-14 passengers",
      "Executive transportation for small teams",
      "Flexible pickup and drop-off locations",
    ],
    cta: "Get Group Quote",
  },
  {
    title: "Large Group Coordination",
    icon: <Bus className="w-6 h-6 text-white" />,
    desc: [
      "Mini buses for 15-30 passengers",
      "Coach buses for 31-50+ passengers",
      "Multi-vehicle coordination for large events",
      "Synchronized arrival and departure scheduling",
    ],
    cta: "Get Group Quote",
  },
  {
    title: "Corporate Events",
    icon: <Building className="w-6 h-6 text-white" />,
    desc: [
      "Conference and convention transportation",
      "Corporate retreat and team building events",
      "Executive meeting transportation",
      "Multi-venue event coordination",
    ],
    cta: "Get Group Quote",
  },
  {
    title: "Speaker Transportation",
    icon: <Stethoscope className="w-6 h-6 text-white" />,
    desc: [
      "Conference speaker transportation",
      "Professional speaker group transport",
      "Event venue and hotel transfers",
      "Corporate event coordination",
    ],
    cta: "Get Group Quote",
  },
];

export default function GroupTransportationPage() {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans">
      {/* Hero + Booking Form */}
      <ServicesHero
        heroImage="/images/Noble_Lane_Fleet_F.webp"
        title="Group Transportation"
        description="Professional group transportation solutions from individual transfers to large corporate events. Sprinter vans, mini buses, and coach buses with multi-vehicle coordination and meet-and-greet service."
      >
        <BookingForm />
      </ServicesHero>

      {/* Group Features Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {groupFeatures.map((feature, index) => (
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

      {/* Core Group Services Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-xl md:text-4xl font-bold text-center mb-12">
            Group Transportation Services in Dallas-Fort Worth
          </h2>
          <p className="text-center max-w-3xl mx-auto text-gray-600 dark:text-gray-400 mb-16 text-base md:text-lg">
            Comprehensive group transportation solutions for corporate events,
            conferences, and speaker transportation throughout the Dallas-Fort
            Worth area.
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
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Ready to Coordinate Your Group Transportation?
              </h3>
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
                Get a customized quote for your group transportation needs with
                professional coordination and fleet options for any event size.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="primary-linear"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push("/book-now")}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Book Group Transport
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-4 text-lg font-semibold border-2 border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-gray-700 transition-all duration-300"
                  onClick={() => router.push("/book-now?type=quote")}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Get Group Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
