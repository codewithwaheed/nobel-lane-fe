// Enhanced pricing logic based on business requirements
import type { BookingFormData } from "./booking-storage";

// Utility function to normalize date and time for consistent parsing
const normalizeDateTimeForParsing = (date: string, time: string): { normalizedDate: string, normalizedTime: string } => {
  // Ensure date is in YYYY-MM-DD format
  let normalizedDate = date;
  if (date.includes('/')) {
    // Convert MM/DD/YYYY or DD/MM/YYYY to YYYY-MM-DD
    const parts = date.split('/');
    if (parts.length === 3) {
      const [first, second, third] = parts;
      if (third.length === 4) {
        // Assume MM/DD/YYYY format (US standard)
        normalizedDate = `${third}-${first.padStart(2, '0')}-${second.padStart(2, '0')}`;
      }
    }
  }
  
  // Ensure time is in HH:MM:SS format
  let normalizedTime = time;
  if (time.length === 5) { // HH:MM format
    normalizedTime = `${time}:00`; // Add seconds
  } else if (time.length === 4) { // H:MM format
    normalizedTime = `0${time}:00`; // Add leading zero and seconds
  }
  
  return { normalizedDate, normalizedTime };
};

export interface PricingBreakdown {
  baseRate: number;
  gratuityRate: number;
  extrasRate: number;
  tollsRate: number;
  totalPrice: number;
  breakdown: {
    isInternational: boolean;
    isEarlyLate: boolean;
    isDFW: boolean;
    extraStopsCount: number;
    hasFlightTracking: boolean;
  };
}

export interface PricingExtras {
  internationalArrival: number;
  earlyLatePickup: number;
  dfwToll: number;
  extraStops: number;
  flightTracking: number;
  total: number;
}

// Business rule constants
export const PRICING_CONSTANTS = {
  GRATUITY_RATE: 0.20, // 20% gratuity
  TOLL_RATE: 0.05, // 5% estimated tolls
  INTERNATIONAL_FEE: 25,
  EARLY_LATE_FEE: 20, // Updated to $20 as requested
  DFW_TOLL: 4.43,
  EXTRA_STOP_FEE: 10,
  FLIGHT_TRACKING_FEE: 5,
};

// Helper functions for smart detection
export const detectInternationalFlight = (flightNumber: string): boolean => {
  if (!flightNumber) return false;
  const internationalPrefixes = [
    "LH",
    "BA",
    "AF",
    "KL",
    "LX",
    "OS",
    "SN",
    "TP",
    "AZ",
    "IB",
    "LU",
    "SK",
    "TK",
    "EK",
    "QR",
    "SV",
    "MS",
    "ET",
    "RJ",
  ];
  return internationalPrefixes.some((prefix) =>
    flightNumber.toUpperCase().startsWith(prefix)
  );
};

export const detectEarlyLatePickup = (date: string, time: string): boolean => {
  if (!date || !time) return false;

  try {
    const { normalizedDate, normalizedTime } = normalizeDateTimeForParsing(date, time);

    // Create pickup datetime in ISO format
    const pickupDateTime = new Date(`${normalizedDate}T${normalizedTime}`);
    
    // Check if the date is valid
    if (isNaN(pickupDateTime.getTime())) {
      console.warn(`Invalid date/time provided: ${date}T${time} (normalized: ${normalizedDate}T${normalizedTime})`);
      return false;
    }

    // Convert to Central Time Zone (America/Chicago)
    const centralTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      hour12: false,
    }).format(pickupDateTime);

    const hour = parseInt(centralTime);

    // Early pickup: before 6 AM CT, Late pickup: after 10 PM CT (22:00)
    return hour < 6 || hour >= 22;
  } catch (error) {
    console.error(`Error detecting early/late pickup for ${date}T${time}:`, error);
    return false;
  }
};

// Helper function to get Central Time Zone hour for debugging
export const getCentralTimeHour = (
  date: string,
  time: string,
): number | null => {
  if (!date || !time) return null;

  try {
    const { normalizedDate, normalizedTime } = normalizeDateTimeForParsing(date, time);

    const pickupDateTime = new Date(`${normalizedDate}T${normalizedTime}`);
    
    // Check if the date is valid
    if (isNaN(pickupDateTime.getTime())) {
      console.warn(`Invalid date/time provided: ${date}T${time} (normalized: ${normalizedDate}T${normalizedTime})`);
      return null;
    }

    const centralTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      hour12: false,
    }).format(pickupDateTime);

    return parseInt(centralTime);
  } catch (error) {
    console.error(`Error getting Central Time hour for ${date}T${time}:`, error);
    return null;
  }
};

export const detectDFWAirport = (
  fromAddress: string,
  toAddress: string = "",
): boolean => {
  const dfwKeywords = [
    "dfw",
    "dallas fort worth",
    "dallas-fort worth",
    "dallas fort worth international",
    "terminal a",
    "terminal b",
    "terminal c",
    "terminal d",
    "terminal e",
  ];
  const addresses = [fromAddress.toLowerCase(), toAddress.toLowerCase()];
  return addresses.some((address) =>
    dfwKeywords.some((keyword) => address.includes(keyword))
  );
};

export const detectDALAirport = (
  fromAddress: string,
  toAddress: string = "",
): boolean => {
  const dalKeywords = [
    "dal",
    "love field",
    "dallas love field",
    "love field airport",
  ];
  const addresses = [fromAddress.toLowerCase(), toAddress.toLowerCase()];
  return addresses.some((address) =>
    dalKeywords.some((keyword) => address.includes(keyword))
  );
};

// Calculate pricing extras based on trip details
export const calculatePricingExtras = (
  bookingData: BookingFormData,
): PricingExtras => {
  const {
    flightNumber = "",
    date,
    time,
    from,
    to = "",
    extraStopsRequired = false,
    extraStopsCount = 0,
  } = bookingData;

  const isInternational = detectInternationalFlight(flightNumber);
  const isEarlyLate = detectEarlyLatePickup(date, time);
  const isDFW = detectDFWAirport(from, to);
  const hasFlightNumber = Boolean(flightNumber.trim());
  const actualExtraStops = extraStopsRequired ? extraStopsCount : 0;

  const internationalArrival = isInternational
    ? PRICING_CONSTANTS.INTERNATIONAL_FEE
    : 0;
  const earlyLatePickup = isEarlyLate ? PRICING_CONSTANTS.EARLY_LATE_FEE : 0;
  const dfwToll = isDFW ? PRICING_CONSTANTS.DFW_TOLL : 0;
  const extraStops = actualExtraStops * PRICING_CONSTANTS.EXTRA_STOP_FEE;
  const flightTracking = hasFlightNumber
    ? PRICING_CONSTANTS.FLIGHT_TRACKING_FEE
    : 0;

  return {
    internationalArrival,
    earlyLatePickup,
    dfwToll,
    extraStops,
    flightTracking,
    total: internationalArrival + earlyLatePickup + dfwToll + extraStops +
      flightTracking,
  };
};

// Calculate complete pricing breakdown
export const calculatePricingBreakdown = (
  bookingData: BookingFormData,
): PricingBreakdown => {
  const basePrice = bookingData.selectedVehicle?.price || 0;

  // Calculate base rate (for hourly, this would be basePrice * hours)
  let baseRate = basePrice;
  if (bookingData.type === "by-the-hour" && bookingData.duration) {
    const hours = parseFloat(bookingData.duration);
    baseRate = basePrice * hours;
  }

  // Calculate gratuity (20% of base rate)
  const gratuityRate = Math.round(baseRate * PRICING_CONSTANTS.GRATUITY_RATE);

  // Calculate extras
  const extras = calculatePricingExtras(bookingData);
  const extrasRate = extras.total;

  // Calculate tolls (5% of base rate, estimated)
  const tollsRate = Math.round(baseRate * PRICING_CONSTANTS.TOLL_RATE);

  // Total price
  const totalPrice = baseRate + gratuityRate + extrasRate + tollsRate;

  return {
    baseRate,
    gratuityRate,
    extrasRate,
    tollsRate,
    totalPrice,
    breakdown: {
      isInternational: extras.internationalArrival > 0,
      isEarlyLate: extras.earlyLatePickup > 0,
      isDFW: extras.dfwToll > 0,
      extraStopsCount: bookingData.extraStopsRequired
        ? (bookingData.extraStopsCount || 0)
        : 0,
      hasFlightTracking: extras.flightTracking > 0,
    },
  };
};

// Get detailed description for each pricing component
export const getPricingDescriptions = () => ({
  baseRate: "Base fare for your selected vehicle and route",
  gratuity: "20% gratuity for your professional chauffeur (industry standard)",
  tolls: "Estimated toll charges for your route (actual tolls may vary)",
  internationalArrival:
    "Additional fee for international flight arrivals (includes extended wait time)",
  earlyLatePickup:
    "Additional $20 fee for pickups before 6 AM or after 10 PM Central Time",
  dfwToll: "DFW Airport toll charges",
  extraStops: "Additional stops during your journey",
  flightTracking: "Flight tracking service to monitor delays and adjustments",
});

// Format price for display
export const formatPrice = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

// Get smart recommendations based on booking
export const getSmartRecommendations = (
  bookingData: BookingFormData,
): string[] => {
  const recommendations: string[] = [];

  if (
    bookingData.flightNumber &&
    !detectInternationalFlight(bookingData.flightNumber)
  ) {
    recommendations.push(
      "✈️ We'll track your flight for any delays or early arrivals",
    );
  }

  if (detectInternationalFlight(bookingData.flightNumber || "")) {
    recommendations.push(
      "🌍 International arrival - we include extra wait time for customs",
    );
  }

  if (detectEarlyLatePickup(bookingData.date, bookingData.time)) {
    recommendations.push(
      "🌙 Early/late pickup (Central Time) - $20 premium time surcharge applies",
    );
  }

  if (detectDFWAirport(bookingData.from, bookingData.to || "")) {
    recommendations.push(
      "🛫 DFW Airport service - toll charges included in pricing",
    );
  }

  if (
    bookingData.extraStopsRequired && bookingData.extraStopsCount &&
    bookingData.extraStopsCount > 0
  ) {
    recommendations.push(
      `🛑 ${bookingData.extraStopsCount} extra stop${
        bookingData.extraStopsCount > 1 ? "s" : ""
      } included`,
    );
  }

  return recommendations;
};
