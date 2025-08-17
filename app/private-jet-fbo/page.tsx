"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Plane,
  Clock,
  UserCheck,
  Car,
  MapPin,
  Radar,
  Crown,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import ServicesHero from "../compoennts/ServiceHeroSection";
import { BookingForm } from "../compoennts/BookingForm";
import ServiceCard from "../compoennts/ServiceCard";

// FBO Service Features Configuration
const fboFeatures = [
  {
    icon: <Plane className="w-6 h-6 text-white" />,
    title: "Seamless FBO Coordination",
    desc: "Direct coordination with all DFW-area FBOs including Atlantic Aviation, Signature Flight Support, and Million Air for streamlined ground transfers.",
  },
  {
    icon: <Clock className="w-6 h-6 text-white" />,
    title: "Real-Time Flight Tracking",
    desc: "Advanced flight monitoring system automatically adjusts pickup times based on real-time flight data and delay notifications. When owner allows tracking.",
  },
  {
    icon: <UserCheck className="w-6 h-6 text-white" />,
    title: "Meet & Greet at Aircraft Steps",
    desc: "Professional chauffeurs meet you directly at your aircraft with personalized service and assistance with luggage handling.",
  },
  {
    icon: <Car className="w-6 h-6 text-white" />,
    title: "Luxury Fleet Available",
    desc: "Choose from our premium fleet of executive sedans, luxury SUVs, and Sprinter vans equipped with Wi-Fi and luxury amenities.",
  },
];

// Service Spotlight Content
const serviceSpotlight = [
  {
    title: "Private Jet Ground Transportation",
    desc: `Experience unparalleled VIP service tailored specifically for private jet passengers. 
Our specialized FBO coordination team works directly with flight crews and ground staff to ensure seamless transitions from aircraft to luxury vehicle.

Enjoy priority handling with expedited customs and immigration processes, dedicated aircraft-side pickup, and luxury amenities including refreshments and Wi-Fi during your ground transfer.

Our professional chauffeurs are trained in executive protocol and discretion, ensuring your privacy and comfort throughout your journey in the Dallas-Fort Worth metroplex.`,
    img: "/images/Dallas_Fort_Worth_Sign_F.webp",
  },
  {
    title: "FBO Coordination Services",
    desc: `Our comprehensive FBO coordination services eliminate the stress of ground transportation planning for private aviation.

We maintain direct relationships with all major FBOs in the DFW area, allowing us to coordinate seamlessly with flight crews, ground handlers, and terminal staff.

From flight plan monitoring to customs coordination, our team handles all ground logistics so you can focus on your business. Real-time updates keep you informed every step of the way.`,
    img: "/images/Chauffeur_Opening_Car_Door_Sunset_F-1-1.webp",
  },
];

// Core FBO Services
const coreServices = [
  {
    title: "Aircraft-Side Pickup",
    icon: <MapPin className="w-6 h-6 text-white" />,
    desc: [
      "Direct coordination with all DFW-area FBOs",
      "Meet and greet service at aircraft steps",
      "Luggage handling and transfer assistance",
      "Expedited customs and immigration coordination",
    ],
    cta: "Book FBO Transport",
  },
  {
    title: "Flight Monitoring Service",
    icon: <Radar className="w-6 h-6 text-white" />,
    desc: [
      "Real-time flight tracking and delay adjustments (when owner allows tracking)",
      "Automatic pickup time modifications",
      "Weather and air traffic delay compensation",
      "24/7 operations center monitoring",
    ],
    cta: "Book Now",
  },
  {
    title: "Executive Ground Transfer",
    icon: <Crown className="w-6 h-6 text-white" />,
    desc: [
      "Luxury sedans and SUVs available",
      "Wi-Fi and mobile office amenities",
      "Refreshment service during transfer",
      "Climate-controlled luxury interiors",
      "Crew transportation available",
    ],
    cta: "Book Now",
  },
  {
    title: "Concierge Coordination",
    icon: <Headphones className="w-6 h-6 text-white" />,
    desc: [
      "Multi-destination trip planning",
      "Hotel and restaurant reservations",
      "Corporate meeting transportation",
      "Special event and conference coordination",
    ],
    cta: "Get Quote",
  },
];

export default function PrivateJetFBOPage() {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans">
      {/* Hero + Booking Form */}
      <ServicesHero
        heroImage="/images/noble-lane-executive-airport-transportF.webp"
        title="Private Jet & FBO Coordination"
        description="Seamless ground transportation coordination with all DFW-area FBOs. Experience white-glove service from aircraft steps to your destination with real-time flight tracking (when owner allows tracking) and luxury fleet options."
      >
        <BookingForm />
      </ServicesHero>

      {/* FBO Features Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {fboFeatures.map((feature, index) => (
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

      {/* Core FBO Services Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-xl md:text-4xl font-bold text-center mb-12">
            Private Jet & FBO Services in Dallas-Fort Worth
          </h2>
          <p className="text-center max-w-3xl mx-auto text-gray-600 dark:text-gray-400 mb-16 text-base md:text-lg">
            Comprehensive ground transportation and coordination services for
            private jet passengers at all DFW-area FBOs including Addison,
            Dallas Executive, and DFW International.
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
                Ready to Experience Premium FBO Transportation?
              </h3>
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
                Get instant quotes for private jet ground transportation or book
                your FBO transfer now. Our team coordinates with all DFW-area
                FBOs for seamless service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="primary-linear"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push("/book-now")}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Book FBO Transport
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-4 text-lg font-semibold border-2 border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-gray-700 transition-all duration-300"
                  onClick={() => router.push("/book-now?type=quote")}
                >
                  <Headphones className="w-5 h-5 mr-2" />
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
