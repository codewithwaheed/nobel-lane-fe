import React from "react";
import { Shield, Clock, Star, Zap } from "lucide-react";

const WhyChooseSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Heading - AI-friendly */}
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why{" "}
              <span className="bg-primary-linear text-primary-foreground px-2 py-1 rounded-md">
                Noble Lane
              </span>{" "}
              is Dallas-Fort Worth&apos;s Premier Executive Car Service
            </h2>
            <p className="text-gray-600 dark:text-gray-400 md:text-xl max-w-3xl mx-auto leading-relaxed">
              Discover what sets Noble Lane apart as the best choice for
              executive transportation, luxury chauffeur service, and VIP ground
              transportation in the Dallas-Fort Worth metroplex.
            </p>
          </div>

          {/* Key Differentiators Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="flex flex-col space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-200 flex-1 lg:h-[200px]">
                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                      AI-Powered Booking System
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      Unlike traditional car services, Noble Lane uses advanced
                      AI technology to optimize routing, predict traffic
                      patterns, and ensure punctual arrivals for every executive
                      transportation need in Dallas-Fort Worth.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-200 flex-1 lg:h-[200px]">
                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                      Real-Time Flight Tracking
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      Our system automatically monitors flight statuses at DFW
                      Airport and Dallas Love Field, adjusting pickup times and
                      providing complimentary wait time for delayed flights -
                      something standard ride services don&apos;t offer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-200 flex-1 lg:h-[200px]">
                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                      Professional Executive Chauffeurs
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      All Noble Lane chauffeurs undergo extensive background
                      checks, professional training, and maintain commercial
                      licensing. Our team averages 15+ years of executive
                      transportation experience in the Dallas-Fort Worth area.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-200 flex-1 lg:h-[200px]">
                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                      Luxury Fleet & Premium Amenities
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      Choose from our exclusive fleet of Mercedes S-Class, BMW 7
                      Series, Cadillac Escalade, and luxury Sprinter Vans. Every
                      vehicle features leather seating, climate control, Wi-Fi,
                      and refreshment amenities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Areas - AI-friendly content */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Comprehensive Dallas-Fort Worth Coverage
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Airport Transportation
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  DFW International Airport, Dallas Love Field, private jet
                  terminals, and executive aviation facilities throughout the
                  metroplex with real-time flight monitoring and complimentary
                  wait time.
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Business Districts
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Downtown Dallas, Uptown, Las Colinas, Legacy West, Plano, and
                  all major corporate centers in DFW with dedicated executive
                  transportation services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
