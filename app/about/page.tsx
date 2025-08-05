"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "../compoennts/ServiceCard";

const stories = [
  {
    name: "Charles Brabham",
    title: "CEO & Founder",
    description: `I am Charles Brabham, the founder of Noble Lane. 
My journey into executive transportation began after 15 years running a photography studio in Southlake and operating a printing company that served advertising firms. 
My 8 years of hands-on VIP driving experience opened my eyes to the unique challenges and opportunities in high-end transportation.

Over the years, I interacted with trip brokers and clients from the East Coast, West Coast, Chicago, and Europe. 
I observed their booking strategies, learned what worked, and noticed a recurring theme: the rising mention of "AI" in business conversations. 
Curiosity sparked, and I began exploring how artificial intelligence could solve real-world transportation pain points.

After years of research, experimentation, and trial-and-error, I developed a system where AI is the engine and human expertise is the driver. 
This fusion of technology and professionalism became the foundation of Noble Lane — a service built on precision, innovation, and trust.`,
    image: "/team3.jpg",
  },
  {
    name: "Mekonnen 'Mike' Habte",
    title: "Lead Chauffeur & Affiliate Manager",
    description: `Mike has been a professional chauffeur for 31 years and founded Corporate Express Transportation in 2008. 
He recalls the peak days when he and his 20-driver team managed 100 trips a day for visiting corporate groups, including seamless hourly dinner transfers.

Mike's reputation is built on reliability and dedication. 
In over three decades of service, he was late only once — due to a scheduling error back in 2004. 
Known for his honesty and leadership, Mike now oversees Noble Lane's chauffeur team and affiliate partnerships, ensuring every ride meets our uncompromising professional standards.`,
    image: "/team1.jpg",
  },
  {
    name: "Robert Seltzer",
    title: "Senior VIP Chauffeur",
    description: `Robert has over 21 years of experience as a professional chauffeur and a genuine passion for helping others. 
His commitment is to deliver excellence — not just to our VIP clients but also to affiliates and fellow drivers.

With a calm, professional presence and a focus on every detail, Robert ensures that every Noble Lane journey reflects our promise of comfort, reliability, and care. 
He embodies the heart of Noble Lane's service philosophy with what we call his "helper heart."`,
    image: "/team2.jpg",
  },
];

const standardsData = [
  {
    title: "Enterprise Security",
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    desc: [
      "Advanced security protocols and background-verified chauffeurs",
      "Complete confidentiality for all executive transportation needs",
      "Secure handling of sensitive information and VIP clients",
      "Comprehensive insurance coverage and safety measures",
    ],
  },
  {
    title: "Professional Excellence",
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    desc: [
      "Immaculate vehicles maintained to the highest standards",
      "Professional attire and courteous chauffeur interactions",
      "Punctual service that exceeds client expectations",
      "Attention to every detail from booking to destination",
    ],
  },
  {
    title: "AI-Powered Efficiency",
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    desc: [
      "Cutting-edge AI optimizes routing and scheduling",
      "Real-time flight tracking and intelligent dispatching",
      "Smart fleet management for maximum efficiency",
      "Human expertise ensures personalized premium service",
    ],
  },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white font-sans">
      <section className="py-12 md:py-16 lg:py-24 container mx-auto px-4">
        {/* Intro */}
        <div className="grid grid-cols-12 justify-center text-center mb-12 md:mb-16">
          <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              The{" "}
              <span className="bg-primary-linear text-primary-foreground px-2 py-1 rounded-md">
                Noble Lane
              </span>{" "}
              Story
            </h1>
            <p className="text-sm md:text-base lg:text-lg font-semibold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent mb-4 md:mb-6">
              60+ years of combined experience in executive transportation,
              powered by cutting-edge AI technology and guided by a commitment
              to excellence.
            </p>
            <p className="text-sm md:text-base lg:text-lg opacity-80 mb-4 leading-relaxed">
              Noble Lane Executive Transport blends cutting-edge AI technology
              with human expertise. We provide premium executive transportation
              in Dallas-Fort Worth for private jet passengers, corporate
              leaders, and VIP events.
            </p>
          </div>
        </div>

        {/* Our Journey Section with Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-20 lg:mb-24"
        >
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Our Journey
            </h2>
            <div className="max-w-4xl mx-auto space-y-4">
              <p className="text-sm md:text-base lg:text-lg opacity-80 leading-relaxed">
                Charles&apos;s path from photography to AI-powered
                transportation began with a vision: combining cutting-edge
                artificial intelligence with human expertise to revolutionize
                executive transport.
              </p>
              <p className="text-lg md:text-xl font-semibold text-amber-600 dark:text-amber-400 italic">
                &ldquo;An AI engine, with a human at the wheel&rdquo;
              </p>
            </div>
          </div>
        </motion.div>

        {/* Team Stories */}
        {stories.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center lg:items-start mb-12 md:mb-16 lg:mb-24 ${
              index % 2 === 0 ? "" : "md:flex-row-reverse"
            }`}
          >
            <div
              className={`col-span-1 md:col-span-6 ${
                index % 2 === 0 ? "md:order-1" : "md:order-2"
              }`}
            >
              <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
                <div className="aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-[center_15%] transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:brightness-110"
                    priority={index === 0}
                    quality={95}
                    unoptimized={false}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-white font-bold text-lg md:text-xl mb-1">
                    {item.name}
                  </h3>
                  <p className="text-white/90 text-sm md:text-base font-medium italic">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
            <div
              className={`col-span-1 md:col-span-6 ${
                index % 2 === 0 ? "md:order-2" : "md:order-1"
              }`}
            >
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {item.name}
                </h2>
                <p className="text-lg text-crimson dark:text-gray-400 mb-4 font-medium italic">
                  {item.title}
                </p>
                <p className="text-base md:text-lg opacity-80 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Our Standards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-20 lg:mb-24"
        >
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
              Our Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {standardsData.map((standard, index) => (
              <ServiceCard key={index} service={standard} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Enhanced Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 text-center max-w-4xl mx-auto"
        >
          {/* Quote Section with Enhanced Design */}
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12 lg:p-16 border border-amber-200 dark:border-gray-700 shadow-xl">
            {/* Decorative Quote Marks */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 text-6xl md:text-8xl text-amber-300 dark:text-amber-600 opacity-30 font-serif leading-none">
              &ldquo;
            </div>
            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 text-6xl md:text-8xl text-amber-300 dark:text-amber-600 opacity-30 font-serif leading-none transform rotate-180">
              &rdquo;
            </div>

            {/* Main Quote */}
            <div className="relative z-10 space-y-6">
              <p className="italic text-2xl md:text-3xl lg:text-4xl font-serif text-amber-600 dark:text-amber-400 font-bold leading-tight">
                Excellence is not an act, but a habit
              </p>
              <p className="text-lg md:text-xl text-amber-700 dark:text-amber-300 font-medium tracking-wide">
                — Arete
              </p>

              {/* Arete Explanation - Condensed */}
              <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-xl p-4 md:p-6 mt-8 border border-white/20 dark:border-gray-700/30">
                <div className="text-gray-700 dark:text-gray-300 space-y-3">
                  <p className="text-sm md:text-base lg:text-lg leading-relaxed">
                    <strong className="text-amber-600 dark:text-amber-400">
                      Arete (ἀρετή)
                    </strong>{" "}
                    is an ancient Greek concept representing the pursuit of
                    excellence and virtue in all aspects of life. At Noble Lane,
                    this philosophy guides everything we do — from meticulous
                    fleet maintenance to personalized client attention to
                    continuous chauffeur training.
                  </p>
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-4">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent w-32 md:w-48"></div>
                <div className="mx-4 w-2 h-2 bg-amber-400 rounded-full"></div>
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent w-32 md:w-48"></div>
              </div>

              {/* Noble Lane Ending */}
              <p className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium italic">
                &ldquo;The path of arete — excellence through virtue and
                mastery. That path is a Noble Lane.&rdquo;
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 md:p-12 lg:p-16 text-center mt-16 md:mt-20 lg:mt-24 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-relaxed md:leading-normal">
            Ready to Experience{" "}
            <span className="bg-primary-linear text-primary-foreground px-2 py-1 rounded-md whitespace-nowrap">
              Noble Lane
            </span>
            ?
          </h2>
          <p className="text-base md:text-lg lg:text-xl opacity-80 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Join our distinguished clients who trust Noble Lane for their most
            important transportation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/book-now?type=quote")}
              className="cursor-pointer"
            >
              Get Quote
            </Button>
            <Button
              variant="primary-linear"
              size="lg"
              onClick={() => router.push("/book-now")}
              className="cursor-pointer"
            >
              Book Now <span aria-hidden="true">&rarr;</span>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
