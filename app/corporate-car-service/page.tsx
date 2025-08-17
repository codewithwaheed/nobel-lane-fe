"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Briefcase,
  Users,
  Clock,
  Shield,
  MapPin,
  Calendar,
  Crown,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import ServicesHero from "../compoennts/ServiceHeroSection";
import { BookingForm } from "../compoennts/BookingForm";
import ServiceCard from "../compoennts/ServiceCard";

// Corporate Service Features Configuration
const corporateFeatures = [
  {
    icon: <Briefcase className="w-6 h-6 text-white" />,
    title: "Executive Meeting Transport",
    desc: "Professional transportation for executive meetings, roadshows, and corporate events with punctual service and business-class amenities.",
  },
  {
    icon: <Users className="w-6 h-6 text-white" />,
    title: "Multi-City Coordination",
    desc: "Seamless multi-city corporate travel coordination with advance planning and real-time communication for complex itineraries.",
  },
  {
    icon: <Shield className="w-6 h-6 text-white" />,
    title: "Business Experience Chauffeurs",
    desc: "Professional chauffeurs with extensive business experience who understand corporate protocols and maintain discretion.",
  },
  {
    icon: <Clock className="w-6 h-6 text-white" />,
    title: "Mobile Office Amenities",
    desc: "Equipped vehicles with Wi-Fi, charging stations, and mobile office setup allowing you to work productively during transit.",
  },
];

// Service Spotlight Content
const serviceSpotlight = [
  {
    title: "Executive Corporate Transportation",
    desc: `Elevate your corporate image with our premium executive transportation services designed for business leaders and corporate teams.

Our professional chauffeurs are trained in corporate etiquette and understand the importance of punctuality and discretion. Every vehicle is equipped with business amenities to ensure productivity during travel.

From board meetings to client presentations, roadshows to corporate events, we provide reliable transportation that reflects your company's professional standards and commitment to excellence.`,
    img: "/images/Business_Professionals_Working_Luxury_Car_F-1.webp",
  },
  {
    title: "Multi-City Corporate Travel",
    desc: `Streamline your multi-city corporate travel with our comprehensive coordination services and experienced logistics team.

We handle complex itineraries across multiple cities, coordinating with your schedule and ensuring seamless transitions between meetings, hotels, and airports.

Our advanced booking system allows for real-time adjustments and our dedicated corporate account managers provide personalized service for your ongoing transportation needs.`,
    img: "/images/Chauffeur_Opening_Car_Door_Sunset_F-1-1.webp",
  },
];

// Core Corporate Services
const coreServices = [
  {
    title: "Executive Meetings & Roadshows",
    icon: <Briefcase className="w-6 h-6 text-white" />,
    desc: [
      "Professional transportation for C-suite executives",
      "Board meeting and investor presentation transport",
      "Multi-stop roadshow coordination",
      "Flexible scheduling for last-minute changes",
    ],
    cta: "Schedule Corporate Service",
  },
  {
    title: "Business Travel Coordination",
    icon: <Calendar className="w-6 h-6 text-white" />,
    desc: [
      "Multi-city corporate travel planning",
      "Airport-to-meeting transportation",
      "Hotel and venue coordination",
      "Advanced booking and scheduling system",
    ],
    cta: "Schedule Corporate Service",
  },
  {
    title: "Professional Chauffeur Service",
    icon: <Crown className="w-6 h-6 text-white" />,
    desc: [
      "Business-experienced professional drivers",
      "Corporate protocol and etiquette training",
      "Confidentiality and discretion guaranteed",
      "Multilingual chauffeurs available",
    ],
    cta: "Schedule Corporate Service",
  },
  {
    title: "Discreet Pickup Options",
    icon: <MapPin className="w-6 h-6 text-white" />,
    desc: [
      "Curbside pickup for privacy and convenience",
      "Baggage claim coordination service",
      "Private entrance and exit coordination",
      "Flexible pickup location arrangements",
    ],
    cta: "Schedule Corporate Service",
  },
];

export default function CorporateCarServicePage() {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans">
      {/* Hero + Booking Form */}
      <ServicesHero
        heroImage="/images/Business_Professionals_Working_Luxury_Car_F-1.webp"
        title="Corporate Car Service"
        description="Professional executive transportation for meetings, roadshows, and corporate travel. Experience business-class service with mobile office amenities and discreet pickup options."
      >
        <BookingForm />
      </ServicesHero>

      {/* Corporate Features Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {corporateFeatures.map((feature, index) => (
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

      {/* Core Corporate Services Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-xl md:text-4xl font-bold text-center mb-12">
            Corporate Transportation Services in Dallas-Fort Worth
          </h2>
          <p className="text-center max-w-3xl mx-auto text-gray-600 dark:text-gray-400 mb-16 text-base md:text-lg">
            Professional corporate transportation solutions for executive
            meetings, roadshows, and business travel throughout the Dallas-Fort
            Worth metroplex.
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
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Ready for Professional Corporate Transportation?
              </h3>
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
                Schedule your executive transportation service with our
                professional chauffeurs and experience business-class travel
                with mobile office amenities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="primary-linear"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push("/book-now")}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Corporate Service
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
