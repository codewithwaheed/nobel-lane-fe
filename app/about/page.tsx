"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const stories = [
  {
    name: "Charles Brabham",
    title: "Founder & Visionary",
    description: `I am Charles Brabham, the founder of Noble Lane. 
My journey into executive transportation began after 15 years running a photography studio in Southlake and operating a printing company that served advertising firms. 
Eight years of driving VIP clients opened my eyes to the unique challenges and opportunities in high-end transportation.

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
He embodies the heart of Noble Lane's service philosophy.`,
    image: "/team2.jpg",
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
              About{" "}
              <span className="bg-primary-linear text-primary-foreground px-2 py-1 rounded-md">
                Noble Lane
              </span>
            </h1>
            <p className="text-sm md:text-base lg:text-lg font-semibold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent mb-4 md:mb-6">
              Our leadership team brings over 60 years of combined experience.
            </p>
            <p className="text-base md:text-lg lg:text-xl opacity-80 mb-4 leading-relaxed">
              Noble Lane Executive Transport blends cutting-edge AI technology
              with human expertise. We provide premium executive transportation
              in Dallas-Fort Worth for private jet passengers, corporate
              leaders, and VIP events.
            </p>
          </div>
        </div>

        {/* Stories */}
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
                <Image
                  src={item.image}
                  alt={item.name}
                  width={600}
                  height={500}
                  className="w-full h-64 md:h-96 lg:h-[500px] object-cover object-top transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-110"
                />
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
