"use client";

import React from "react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  service: {
    title: string;
    icon: React.ReactNode;
    desc: string[];
    cta?: string;
  };
  index: number;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, index }) => {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: "easeOut",
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      viewport={{ once: true, margin: "-30px" }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200 group"
    >
      {/* Icon Header */}
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 ease-out">
          {service.icon}
        </div>
        <h3 className="text-lg md:text-2xl font-bold ml-4 text-gray-900 dark:text-white">
          {service.title}
        </h3>
      </div>

      {/* Service Features */}
      <ul className="space-y-3 text-gray-600 dark:text-gray-300">
        {service.desc.map((point, i) => (
          <li key={i} className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3"></div>
            <span className="text-xs md:text-base leading-relaxed">
              {point}
            </span>
          </li>
        ))}
      </ul>

      {/* Decorative Bottom Border */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full group-hover:w-20 transition-all duration-200 ease-out"></div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
