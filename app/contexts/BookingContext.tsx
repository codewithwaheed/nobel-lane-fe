"use client";

import React, { createContext, useContext, useState } from "react";

interface BookingContextType {
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <BookingContext.Provider
      value={{ isBookingModalOpen, setIsBookingModalOpen }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
