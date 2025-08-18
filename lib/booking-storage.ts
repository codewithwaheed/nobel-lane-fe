// Utility functions for handling booking form data in sessionStorage

export interface VehicleOption {
  id: number;
  name: string;
  image: string;
  passengers: number;
  bags: number;
  price: number;
  description: string;
  vehicleId: string; // Backend vehicle ID for pricing API
}

export interface BookingFormData {
  // Original form data
  type: "one-way" | "by-the-hour";
  from: string;
  to?: string;
  duration?: string;
  date: string;
  time: string;
  submittedAt: string;

  // Wizard specific data
  passengers: number;
  selectedVehicle?: VehicleOption;
  flightNumber?: string;
  notes?: string;
  phone?: string;
  email?: string;
  isQuote: boolean;
  quoteOrigin?: "explicit" | "auto-fallback"; // Track if quote was explicitly requested or auto-converted due to no pricing
  currentStep: number;
  completedSteps: number[];

  // Extra stops
  extraStopsRequired?: boolean;
  extraStopsCount?: number;

  // Place details (optional, set when using autocomplete)
  fromPlaceId?: string;
  toPlaceId?: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  fromZipcode?: string;
  toZipcode?: string;
  fromCity?: string;
  toCity?: string;
  fromState?: string;
  toState?: string;
}

export const BOOKING_STORAGE_KEY = "bookingFormData";

export const defaultBookingData: Partial<BookingFormData> = {
  passengers: 1,
  isQuote: false,
  currentStep: 1,
  completedSteps: [],
};

/**
 * Save booking form data to sessionStorage
 */
export function saveBookingData(
  data: Omit<BookingFormData, "submittedAt" | "date"> & { date: Date },
): boolean {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return false;

    const storageData: BookingFormData = {
      ...data,
      date: data.date.toISOString(),
      submittedAt: new Date().toISOString(),
    } as BookingFormData;

    sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error("Failed to save booking data to sessionStorage:", error);
    return false;
  }
}

/**
 * Update specific booking data fields
 */
export function updateBookingData(updates: Partial<BookingFormData>): boolean {
  try {
    if (typeof window === "undefined") return false;

    const existing = getBookingData() || ({} as BookingFormData);
    const updated = { ...existing, ...updates } as BookingFormData;

    sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Failed to update booking data:", error);
    return false;
  }
}

/**
 * Retrieve booking form data from sessionStorage
 */
export function getBookingData(): BookingFormData | null {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return null;

    const savedData = sessionStorage.getItem(BOOKING_STORAGE_KEY);
    if (!savedData) return null;

    return JSON.parse(savedData) as BookingFormData;
  } catch (error) {
    console.error("Failed to retrieve booking data from localStorage:", error);
    return null;
  }
}

/**
 * Clear booking form data from sessionStorage
 */
export function clearBookingData(): boolean {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return false;

    sessionStorage.removeItem(BOOKING_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear booking data from sessionStorage:", error);
    return false;
  }
}

// Vehicle fleet data for the wizard
export const vehicleFleet: VehicleOption[] = [
  {
    id: 1,
    name: "Executive Sedan",
    image: "/standard-sedan.png",
    passengers: 4,
    bags: 2,
    price: 110, // Fallback price - will be replaced by backend pricing
    description:
      "Executive-level sedan service with priority service and executive amenities.",
    vehicleId: "executive_sedan", // Backend vehicle ID
  },
  {
    id: 2,
    name: "Executive SUV",
    image: "/luxury-suv.png",
    passengers: 6,
    bags: 4,
    price: 129, // Fallback price - will be replaced by backend pricing
    description:
      "Professional executive transport with business amenities and phone chargers.",
    vehicleId: "executive_suv", // Backend vehicle ID
  },
  {
    id: 3,
    name: "Luxury Sedan",
    image: "/luxury-sedan.png",
    passengers: 4,
    bags: 2,
    price: 285, // Fallback price - will be replaced by backend pricing
    description:
      "Premium comfort and style with premium leather seats and WiFi available.",
    vehicleId: "luxury_suv", // Backend vehicle ID (maps to luxury_suv pricing)
  },
  {
    id: 4,
    name: "Luxury SUV",
    image: "/luxury-suv.png",
    passengers: 6,
    bags: 4,
    price: 285, // Fallback price - will be replaced by backend pricing
    description:
      "Spacious luxury for groups, seats up to 6 with premium sound system.",
    vehicleId: "luxury_suv", // Backend vehicle ID
  },
  {
    id: 5,
    name: "Sprinter Van",
    image: "/sprinter-van.png",
    passengers: 13,
    bags: 10,
    price: 199, // Fallback price - will be replaced by backend pricing
    description:
      "Large group transportation, seats up to 13 with entertainment system.",
    vehicleId: "sprinter", // Backend vehicle ID
  },
]; /**
 * Check if booking data exists and is recent (within 24 hours)
 */

export function hasRecentBookingData(): boolean {
  const data = getBookingData();
  if (!data?.submittedAt) return false;

  const submittedAt = new Date(data.submittedAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60);

  return hoursDiff < 24; // Data is recent if submitted within last 24 hours
}
