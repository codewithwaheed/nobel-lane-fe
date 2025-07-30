"use client";
import { useState } from "react";
import Header from "./compoennts/Header";
import HeroSection from "./compoennts/HeroSection";
import { Dialog, DialogPanel } from "@headlessui/react";
import { BookingForm } from "./compoennts/BookingForm";
import { XMarkIcon } from "@heroicons/react/24/outline";
import SkillsSection from "./compoennts/SkillsSection";
import { FleetSection } from "./compoennts/FleetSection";
import OurTeamSection from "./compoennts/OurTeamSection";
import Footer from "./compoennts/Footer";
import ReviewsSection from "./compoennts/ReviewsSection";

export default function Home() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  return (
    <div>
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
      <Header setIsBookingModalOpen={setIsBookingModalOpen} />
      <HeroSection setIsBookingModalOpen={setIsBookingModalOpen} />
      <SkillsSection />
      <FleetSection />
      <OurTeamSection />
      <ReviewsSection />
      <Footer />
    </div>
  );
}
