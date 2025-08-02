"use client";

import Header from "./compoennts/Header";
import Footer from "./compoennts/Footer";
import { Dialog, DialogPanel } from "@headlessui/react";
import { BookingForm } from "./compoennts/BookingForm";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { BookingProvider, useBooking } from "./contexts/BookingContext";

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const { isBookingModalOpen, setIsBookingModalOpen } = useBooking();

  return (
    <>
      <Header setIsBookingModalOpen={setIsBookingModalOpen} />
      {children}
      <Footer />

      {/* Global Booking Modal */}
      <Dialog
        open={isBookingModalOpen}
        onClose={setIsBookingModalOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700 cursor-pointer"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <BookingForm isModal />
        </DialogPanel>
      </Dialog>
    </>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </BookingProvider>
  );
}
