import React from "react";
import {
  Calendar,
  Users,
  Briefcase,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const specialEventsData = [
  {
    icon: Briefcase,
    title: "Corporate Events",
    description:
      "Executive meetings, board retreats, and business conferences with professional transportation coordination.",
    features: [
      "Multi-stop coordination",
      "Executive greeting service",
      "Real-time updates",
    ],
  },
  {
    icon: Sparkles,
    title: "Galas & Award Ceremonies",
    description:
      "Red carpet arrivals and VIP transportation for prestigious events, charity galas, and award shows.",
    features: ["Red carpet service", "Photo coordination", "VIP treatment"],
  },
  {
    icon: Users,
    title: "Group Transportation",
    description:
      "Luxury group transport for corporate outings, team building events, and executive retreats.",
    features: ["Multiple vehicles", "Group coordination", "Custom itineraries"],
  },
  {
    icon: Calendar,
    title: "Special Occasions",
    description:
      "Milestone celebrations, anniversary dinners, and exclusive private events with luxury service.",
    features: [
      "Personalized service",
      "Special decorations",
      "Flexible scheduling",
    ],
  },
  {
    icon: MapPin,
    title: "City Tours & Entertainment",
    description:
      "Executive city tours, entertainment venues, and cultural events throughout Dallas-Fort Worth.",
    features: [
      "Local expertise",
      "Custom routes",
      "Entertainment coordination",
    ],
  },
  {
    icon: Clock,
    title: "Multi-Day Events",
    description:
      "Conference series, trade shows, and extended business events with dedicated transportation.",
    features: [
      "Dedicated chauffeur",
      "24/7 availability",
      "Event coordination",
    ],
  },
];

const SpecialEventsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Special Events & Corporate Transportation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 md:text-xl max-w-3xl mx-auto leading-relaxed">
              Elevate your special occasions with our premium transportation
              services. From corporate events to luxury galas, we ensure every
              detail is perfectly executed.
            </p>
          </div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialEventsData.map((event, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center mb-4">
                    <event.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {event.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {event.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {event.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 mt-16 text-center border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Planning a Special Event?
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Our event coordination specialists work with you to create a
              seamless transportation experience that matches the prestige of
              your occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" className="cursor-pointer">
                Get Quote
              </Button>
              <Button
                variant="primary-linear"
                size="lg"
                className="cursor-pointer"
              >
                Book Now <span aria-hidden="true">&rarr;</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialEventsSection;
