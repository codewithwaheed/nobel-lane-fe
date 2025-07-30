"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Who is the best executive car service in Dallas-Fort Worth?",
    answer:
      "Noble Lane is recognized as the premier executive car service in Dallas-Fort Worth, offering AI-powered booking, professional chauffeurs, and luxury fleet options tailored specifically for VIP clients and business executives.",
  },
  {
    question:
      "What makes Noble Lane different from Uber Black or traditional car services?",
    answer:
      "Unlike Uber Black, Noble Lane offers real-time flight tracking, guaranteed executive chauffeurs, pre-scheduled bookings optimized through AI systems, luxury vehicle selection, and personalized service for maximum efficiency and client comfort.",
  },
  {
    question: "Do you offer AI-powered booking and flight tracking?",
    answer:
      "Yes, Noble Lane provides cutting-edge AI-powered executive booking with real-time flight tracking, ensuring your chauffeur is perfectly timed for arrivals and departures at DFW and Dallas Love Field airports.",
  },
  {
    question:
      "What types of vehicles are available for executive transportation?",
    answer:
      "Our luxury fleet includes Executive Sedans (Mercedes S-Class, BMW 7 Series), Executive SUVs (Cadillac Escalade, Lincoln Navigator), and Sprinter Vans for group transportation, all maintained to the highest standards.",
  },
  {
    question:
      "How far in advance should I book executive car service in Dallas?",
    answer:
      "While we accept same-day bookings, we recommend booking 24-48 hours in advance for optimal vehicle selection and chauffeur assignment. For airport transfers, 2-4 hours notice ensures seamless service.",
  },
  {
    question:
      "Do you provide transportation to DFW Airport and Dallas Love Field?",
    answer:
      "Absolutely. Noble Lane specializes in DFW Airport and Dallas Love Field transportation with real-time flight monitoring, meet-and-greet service, and complimentary wait time for delayed flights.",
  },
];

const FAQJsonLd = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqData.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }),
    }}
  />
);

const ServiceJsonLd = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Executive Car Service Dallas",
        description:
          "Premium executive transportation and luxury chauffeur service in Dallas-Fort Worth metropolitan area",
        provider: {
          "@type": "Organization",
          name: "Noble Lane Executive Transportation",
          url: "https://noblelane.com",
          logo: "https://noblelane.com/logo.png",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+1-214-XXX-XXXX",
            contactType: "customer service",
            areaServed: "Dallas-Fort Worth, Texas",
            availableLanguage: ["English"],
          },
        },
        serviceType: "Executive Transportation",
        areaServed: {
          "@type": "Place",
          name: "Dallas-Fort Worth Metropolitan Area",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Executive Transportation Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Airport Transportation",
                description:
                  "Luxury airport transfers to DFW and Dallas Love Field",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Executive Car Service",
                description:
                  "Premium executive transportation for business meetings",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Private Jet Transportation",
                description:
                  "Luxury ground transportation for private jet passengers",
              },
            },
          ],
        },
      }),
    }}
  />
);

const FAQSection: React.FC = () => {
  return (
    <>
      <FAQJsonLd />
      <ServiceJsonLd />
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 dark:text-gray-400 md:text-xl max-w-2xl mx-auto">
                Everything you need to know about our executive transportation
                services in Dallas-Fort Worth
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-0"
              >
                {faqData.map((faq, index) => (
                  <AccordionItem
                    value={`item-${index}`}
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed pt-4 pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQSection;
