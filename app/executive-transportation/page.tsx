"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Zap, Clock, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import ServicesHero from "../compoennts/ServiceHeroSection";
import { BookingForm } from "../compoennts/BookingForm";

export default function ExecutiveTransportationPage() {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans">
      {/* Hero + Booking Form */}
      <ServicesHero
        heroImage="/images/Chauffeur_Opening_Car_Door_Sunset_F-1-1.webp"
        title="Executive Transportation"
      >
        <BookingForm />
      </ServicesHero>

      {/* 4-Feature Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              {
                icon: <Zap className="w-6 h-6 text-white" />,
                title: "AI-Powered Routing",
                desc: "Our smart technology predicts traffic and optimizes routing to ensure punctual and seamless executive transfers.",
              },
              {
                icon: <Clock className="w-6 h-6 text-white" />,
                title: "Real-Time Flight Tracking",
                desc: "Automatic flight monitoring at DFW and Dallas Love Field ensures timely pickups even during delays.",
              },
              {
                icon: <Shield className="w-6 h-6 text-white" />,
                title: "Professional Chauffeurs",
                desc: "Our veteran chauffeurs provide discreet, safe, and professional service for VIP clients and executives.",
              },
              {
                icon: <Star className="w-6 h-6 text-white" />,
                title: "Luxury Fleet",
                desc: "Travel in comfort with our executive sedans, SUVs, and Sprinter vans, equipped with Wi-Fi and leather seating.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {[
        {
          title: "Private Jet & FBO Transportation",
          desc: `Experience seamless, white-glove VIP service from the moment your plane touches down. 
Our professional chauffeurs coordinate directly with all DFW-area FBOs to provide a smooth transition from aircraft to luxury vehicle. 
Enjoy complimentary flight tracking, flexible pickup adjustments, and meet-and-greet service right at the aircraft steps. 
Travel in ultimate comfort with our fleet of executive sedans and SUVs, fully equipped with Wi-Fi, leather seating, and refreshments for a first-class ground experience.`,
          img: "/luxury-suv.png",
        },
        {
          title: "Corporate Car Service",
          desc: `Designed for high-level business travel, our corporate car service ensures punctuality, discretion, and comfort. 
Whether attending multi-city meetings, executive roadshows, or corporate events, our chauffeurs provide a seamless mobile office experience. 
We offer discreet pickup options at baggage claim or curbside, while our luxury vehicles come equipped with Wi-Fi, charging ports, climate control, and privacy-tinted windows. 
Stay productive on the road and arrive at your destination prepared and refreshed.`,
          img: "/luxury-sedan.png",
        },
      ].map((item, index) => (
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
                src={item.img}
                alt={item.title}
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
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {item.title}
              </h2>
              <p className="text-base md:text-lg opacity-80 leading-relaxed whitespace-pre-line">
                {item.desc}
              </p>
            </div>
          </div>
        </motion.section>
      ))}

      {/* Core Services Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-12">
            Executive Transportation Services in Dallas-Fort Worth
          </h2>
          <p className="text-center max-w-3xl mx-auto text-gray-600 dark:text-gray-400 mb-16 text-lg">
            Premium car service solutions for private jet passengers, corporate
            executives, and VIP clients throughout the DFW metroplex.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Private Jet & FBO Transportation",
                desc: [
                  "Seamless coordination with all DFW FBOs",
                  "Real-time flight tracking and delay adjustments",
                  "Meet and greet at aircraft steps",
                  "Luxury sedans and SUVs available",
                ],
                cta: "Book FBO Transport",
              },
              {
                title: "Corporate Car Service",
                desc: [
                  "Executive meetings and roadshows",
                  "Multi-city corporate travel coordination",
                  "Professional chauffeurs with business experience",
                  "Discreet pickup options with mobile office amenities",
                ],
                cta: "Schedule Corporate Service",
              },
              {
                title: "Airport Transfers",
                desc: [
                  "Service for DFW & Dallas Love Field",
                  "Complimentary flight monitoring",
                  "Flexible pickup locations with professional service",
                  "Transparent pricing with no surge fees",
                ],
                cta: "Book Airport Transfer",
              },
              {
                title: "Group Transportation",
                desc: [
                  "Sprinter vans, mini buses, and coach buses available",
                  "Multi-vehicle coordination for large events",
                  "Corporate conferences and medical speaker transportation",
                  "Meet and greet service available",
                ],
                cta: "Get Group Quote",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600 dark:text-gray-400">
                  {service.desc.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
                <Button
                  variant="primary-linear"
                  size="lg"
                  onClick={() => router.push("/book-now")}
                >
                  {service.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
