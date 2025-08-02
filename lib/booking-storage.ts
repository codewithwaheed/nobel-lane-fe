// Utility functions for handling booking form data in localStorage

export interface BookingFormData {
  type: "one-way" | "by-the-hour";
  from: string;
  to?: string;
  duration?: string;
  date: string;
  time: string;
  submittedAt: string;
}

export const BOOKING_STORAGE_KEY = "bookingFormData";

/**
 * Save booking form data to localStorage
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
    };

    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error("Failed to save booking data to localStorage:", error);
    return false;
  }
}

/**
 * Retrieve booking form data from localStorage
 */
export function getBookingData(): BookingFormData | null {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return null;
    
    const savedData = localStorage.getItem(BOOKING_STORAGE_KEY);
    if (!savedData) return null;

    return JSON.parse(savedData) as BookingFormData;
  } catch (error) {
    console.error("Failed to retrieve booking data from localStorage:", error);
    return null;
  }
}

/**
 * Clear booking form data from localStorage
 */
export function clearBookingData(): boolean {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return false;
    
    localStorage.removeItem(BOOKING_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear booking data from localStorage:", error);
    return false;
  }
}

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
