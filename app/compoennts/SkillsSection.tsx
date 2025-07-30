import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";
import React from "react";
const skillsData = [
  {
    name: "Professional Drivers",
    description: `Experienced, vetted chauffeurs who
understand the importance of discretion
and punctuality.`,
    icon: "/skills5.svg",
  },
  {
    name: "Transparent Pricing",
    description: `No hidden fees, no surge pricing. Get
accurate quotes instantly with our AI 
pricing engine.`,
    icon: "/skills6.svg",
  },
  {
    name: "AI Automation",
    description: `Intelligent workflows that learn and adapt
to your business patterns, reducing
manual tasks by 80%.`,
    icon: "/skills1.svg",
  },
  {
    name: "Real-time Analytics",
    description: `Advanced data visualization with
predictive insights to make informed
decisions faster.`,
    icon: "/skills2.svg",
  },
  {
    name: "Enterprise Security",
    description: `Bank-grade security with end-to-end
encryption and compliance with global
standards.`,
    icon: "/skills3.svg",
  },
  {
    name: "AI-Powered Intelligence",
    description: `Smart route optimization, predictive
scheduling, and real-time traffic analysis
for maximum efficiency.`,
    icon: "/skills4.svg",
  },
];
export default function SkillsSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 my-10">
      <h1 className="text-2xl md:text-4xl text-center font-bold mb-3">
        Technology Meets Human Excellence
      </h1>
      <p className="text-gray-600 md:text-xl text-center mt-2 mb-8  md:max-w-3xl mx-auto">
        We combine cutting-edge AI technology with experienced human drivers to
        deliver unparalleled executive transportation experiences.
      </p>
      <ScrollArea className="w-full whitespace-nowrap py-4">
        <div className="flex md:grid md:grid-cols-3 gap-6 md:max-w-4xl lg:max-w-7xl mx-auto">
          {skillsData.map((skill, index) => (
            <div
              key={index}
              className="bg-white min-w-[260px] md:max-w-[380px] min-h-[200px] md:min-h-[260px] p-6 rounded-lg shadow-md border border-[#D1D5DB] hover:bg-gray-50 transition duration-200"
            >
              <div className="flex items-center text-white justify-center mb-4 md:mb-6 bg-primary-linear w-[48px] h-[48px] rounded-lg p-4">
                <Image
                  src={skill.icon}
                  alt={`Skill ${index + 1}`}
                  className="text-white w-6 h-6"
                  width={24}
                  height={24}
                />
              </div>
              <h4 className="text-lg md:text-xl font-semibold mb-3">
                {skill.name}
              </h4>
              <p className="text-sm md:text-base text-gray-600 text-wrap">
                {skill.description}
              </p>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
