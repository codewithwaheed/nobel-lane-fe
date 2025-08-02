"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Header from "../compoennts/Header";
import Footer from "../compoennts/Footer";
import { Button } from "@/components/ui/button";

const stories = [
  {
    title: "Charles Brabham – Founder & Visionary",
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
    title: "Mekonnen 'Mike' Habte – Lead Chauffeur & Affiliate Manager",
    description: `Mike has been a professional chauffeur for 31 years and founded Corporate Express Transportation in 2008. 
He recalls the peak days when he and his 20-driver team managed 100 trips a day for visiting corporate groups, including seamless hourly dinner transfers.

Mike’s reputation is built on reliability and dedication. 
In over three decades of service, he was late only once — due to a scheduling error back in 2004. 
Known for his honesty and leadership, Mike now oversees Noble Lane’s chauffeur team and affiliate partnerships, ensuring every ride meets our uncompromising professional standards.`,
    image: "/team1.jpg",
  },
  {
    title: "Robert Seltzer – Senior VIP Chauffeur",
    description: `Robert has over 21 years of experience as a professional chauffeur and a genuine passion for helping others. 
His commitment is to deliver excellence — not just to our VIP clients but also to affiliates and fellow drivers.

With a calm, professional presence and a focus on every detail, Robert ensures that every Noble Lane journey reflects our promise of comfort, reliability, and care. 
He embodies the heart of Noble Lane’s service philosophy.`,
    image: "/team2.jpg",
  },
];

export default function AboutPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Header setIsBookingModalOpen={setIsBookingModalOpen} />
      <main className="bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white font-sans">
        <section className="py-14 md:py-24 container mx-auto px-4">
          {/* Intro */}
          <div className="grid grid-cols-12 justify-center text-center mb-12">
            <div className="col-span-12 md:col-span-8 md:col-start-3">
                                            <h1 className="text-4xl leading-snug md:text-5xl md:leading-snug font-bold mb-6">
                 About Noble Lane
              </h1>
              <p className="text-lg md:text-xl opacity-80 mb-4">
                Noble Lane Executive Transport blends cutting-edge AI technology
                with human expertise. We provide premium executive transportation
                in Dallas-Fort Worth for private jet passengers, corporate leaders,
                and VIP events.
              </p>
              <p className="text-md md:text-lg font-semibold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Our leadership team brings over 60 years of combined experience.
              </p>
            </div>
          </div>

          {/* Stories */}
          {stories.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-12 items-center justify-center mt-16 gap-6 md:gap-12"
            >
              <div
                className={`col-span-12 md:col-span-5 flex flex-col justify-center
                  ${index % 2 === 0 
                    ? "order-2 md:order-1 md:col-start-2 lg:pr-12"  
                    : "order-2 md:order-2 md:col-start-7 lg:pl-12"
                  }`}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{item.title}</h2>
                <p className="text-base md:text-lg opacity-80 whitespace-pre-line text-justify leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div
                className={`col-span-12 md:col-span-5
                  ${index % 2 === 0 
                    ? "order-1 md:order-2 md:col-start-7"  
                    : "order-1 md:order-1 md:col-start-2"
                  }`}
              >
                <div className="group bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden">
                  <div className="relative w-full h-80 sm:h-96 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw,
                             (max-width: 1200px) 50vw,
                             33vw"
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Arete */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-20 text-center max-w-2xl mx-auto"
          >
            <p className="italic text-xl md:text-2xl font-serif text-yellow-500">
              “Excellence is not an act, but a habit – Arete”
            </p>
            <p className="mt-4 text-base md:text-lg leading-relaxed opacity-80">
              We attract chauffeurs who live the philosophy of Arete — 
              mastering their craft with professionalism and heart. 
              They walk this noble lane every day.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary-linear"
              className="font-semibold w-full sm:w-auto"
              onClick={() => router.push("/book")}
            >
              Book Now →
            </Button>

            <Button
              variant="outline"
              className="font-semibold w-full sm:w-auto text-orange-500 border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900"
              onClick={() => router.push("/contact-us")}
            >
              Contact Us
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
