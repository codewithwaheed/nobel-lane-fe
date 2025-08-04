"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Stethoscope,
  Clock,
  Shield,
  Calendar,
  MapPin,
  UserCheck,
  Building2,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import ServicesHero from "../compoennts/ServiceHeroSection";
import { BookingForm } from "../compoennts/BookingForm";
import ServiceCard from "../compoennts/ServiceCard";

// Medical Speaker Transport Features Configuration
const medicalFeatures = [
  {
    icon: <Stethoscope className="w-6 h-6 text-white" />,
    title: "Healthcare Professional Service",
    desc: "Specialized transportation for medical speakers, healthcare professionals, and pharmaceutical executives attending conferences and medical events.",
  },
  {
    icon: <Clock className="w-6 h-6 text-white" />,
    title: "Conference Schedule Coordination",
    desc: "Professional coordination with medical conference schedules, ensuring timely arrivals for presentations, keynotes, and panel discussions.",
  },
  {
    icon: <Shield className="w-6 h-6 text-white" />,
    title: "Confidential & Professional Service",
    desc: "Discreet transportation service understanding the importance of patient confidentiality and professional healthcare standards.",
  },
  {
    icon: <Building2 className="w-6 h-6 text-white" />,
    title: "Hospital & Venue Transfers",
    desc: "Reliable transportation between hospitals, medical centers, conference venues, and hotels with knowledge of healthcare facility protocols.",
  },
];

// Service Spotlight Content
const serviceSpotlight = [
  {
    title: "Medical Conference Speaker Transportation",
    desc: `Provide your medical speakers and healthcare professionals with reliable, professional transportation that understands the demands of medical conferences and events.

Our experienced chauffeurs are familiar with medical conference schedules, hospital protocols, and the importance of punctuality for healthcare professionals. We ensure your speakers arrive refreshed and on time for their presentations.

From pharmaceutical conferences to medical symposiums, we handle transportation logistics so your speakers can focus on delivering life-saving knowledge and advancing medical science.`,
    img: "/business-car.jpeg",
  },
  {
    title: "Healthcare Facility Coordination",
    desc: `Seamlessly coordinate transportation between hospitals, medical centers, research facilities, and conference venues with our specialized healthcare transportation service.

We understand the unique requirements of medical professionals, including the need for confidentiality, flexibility for emergency situations, and coordination with complex hospital schedules.

Our service extends to pharmaceutical events, medical device demonstrations, and continuing medical education programs throughout the Dallas-Fort Worth medical community.`,
    img: "/contact-us.jpeg",
  },
];

// Core Medical Speaker Services
const coreServices = [
  {
    title: "Medical Conference Speakers",
    icon: <Stethoscope className="w-6 h-6 text-white" />,
    desc: [
      "Keynote speaker and presenter transportation",
      "Medical conference and symposium logistics",
      "Multi-venue conference coordination",
      "Flexible scheduling for medical emergencies",
    ],
    cta: "Book Medical Transport",
  },
  {
    title: "Healthcare Professional Travel",
    icon: <UserCheck className="w-6 h-6 text-white" />,
    desc: [
      "Physician and specialist transportation",
      "Pharmaceutical executive service",
      "Medical device company coordination",
      "Continuing education event transport",
    ],
    cta: "Book Medical Transport",
  },
  {
    title: "Hospital & Medical Facility Service",
    icon: <Building2 className="w-6 h-6 text-white" />,
    desc: [
      "Hospital-to-conference venue transfers",
      "Medical center coordination service",
      "Research facility transportation",
      "Healthcare campus navigation assistance",
    ],
    cta: "Book Medical Transport",
  },
  {
    title: "Pharmaceutical Event Coordination",
    icon: <Calendar className="w-6 h-6 text-white" />,
    desc: [
      "Pharmaceutical conference transportation",
      "Drug launch event coordination",
      "Medical advisory board meetings",
      "Clinical trial investigator transport",
    ],
    cta: "Book Medical Transport",
  },
];

export default function MedicalSpeakerTransportPage() {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans">
      {/* Hero + Booking Form */}
      <ServicesHero
        heroImage="/hero-cover.jpeg"
        title="Medical Speaker Transportation"
        description="Professional transportation for medical speakers, healthcare professionals, and pharmaceutical executives. Specialized service for medical conferences, hospital transfers, and healthcare events."
      >
        <BookingForm />
      </ServicesHero>

      {/* Medical Features Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {medicalFeatures.map((feature, index) => (
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

      {/* Core Medical Services Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-xl md:text-4xl font-bold text-center mb-12">
            Medical Speaker Transportation Services in Dallas-Fort Worth
          </h2>
          <p className="text-center max-w-3xl mx-auto text-gray-600 dark:text-gray-400 mb-16 text-base md:text-lg">
            Specialized transportation for medical speakers, healthcare
            professionals, and pharmaceutical events throughout the Dallas-Fort
            Worth medical community.
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
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Ready for Professional Medical Speaker Transportation?
              </h3>
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
                Ensure your medical speakers and healthcare professionals arrive
                on time with our specialized transportation service for medical
                events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="primary-linear"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push("/book-now")}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Book Medical Transport
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
