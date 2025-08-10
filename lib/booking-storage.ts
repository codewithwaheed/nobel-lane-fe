// Utility functions for handling booking form data in sessionStorage

export interface VehicleOption {
  id: number;
  name: string;
  image: string;
  passengers: number;
  bags: number;
  price: number;
  description: string;
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
  currentStep: number;
  completedSteps: number[];

  // Place details (optional, set when using autocomplete)
  fromPlaceId?: string;
  toPlaceId?: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
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
  data: Omit<BookingFormData, "submittedAt" | "date"> & { date: Date }
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
    name: "Luxury Sedan",
    image: "/luxury-sedan.png",
    passengers: 4,
    bags: 2,
    price: 85,
    description: "A comfortable luxury sedan for up to 4 passengers.",
  },
  {
    id: 2,
    name: "Luxury SUV",
    image: "/luxury-suv.png",
    passengers: 6,
    bags: 4,
    price: 125,
    description: "A spacious SUV for up to 6 passengers.",
  },
  {
    id: 3,
    name: "Sprinter Van",
    image: "/sprinter-van.png",
    passengers: 12,
    bags: 8,
    price: 180,
    description: "A large sprinter van for group travel.",
  },
  {
    id: 4,
    name: "Standard Sedan",
    image: "/standard-sedan.png",
    passengers: 4,
    bags: 2,
    price: 65,
    description: "A reliable standard sedan for comfortable transportation.",
  },
];

/**
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
