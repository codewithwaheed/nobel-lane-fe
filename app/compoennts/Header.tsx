"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogPanel, PopoverGroup } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import PhoneCall from "./PhoneCall";

export default function Header({
  setIsBookingModalOpen,
}: {
  setIsBookingModalOpen: (open: boolean) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 dark:border-gray-700">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 pb-0 md:pb-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only"> Nobel Lane</span>
            <Image
              alt=""
              src="/logo.png"
              width={220}
              height={90}
              className="h-10 mb-2 md:mb-0 md:h-12 w-auto"
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-8">
          <Link
            href="/#services"
            className="text-sm/6 font-semibold text-gray-900"
          >
            Services
          </Link>
          <Link
            href="/book-now"
            className="text-sm/6 font-semibold text-gray-900"
          >
            Book Now
          </Link>
          <Link href="/about" className="text-sm/6 font-semibold text-gray-900">
            About
          </Link>
          <Link
            href="/contact-us"
            className="text-sm/6 font-semibold text-gray-900"
          >
            Contact
          </Link>
        </PopoverGroup>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <PhoneCall />
          <Link href="/book-now?type=quote">
            <Button variant="outline" className="font-semibold">
              Get Quote
            </Button>
          </Link>
          <Link href="/book-now" className="ml-3">
            <Button variant="primary-linear" className="font-semibold">
              Book Now <span aria-hidden="true">&rarr;</span>
            </Button>
          </Link>
        </div>
      </nav>
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex-1">
            <PhoneCall />
          </div>
          <Button
            variant="primary-linear"
            size="sm"
            className="font-semibold flex-1 ml-2"
            onClick={() => setIsBookingModalOpen(true)}
          >
            Book Now <span aria-hidden="true">&rarr;</span>
          </Button>
        </div>
      </div>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Noble Lane</span>
              <Image
                alt=""
                src="/logo.png"
                width={32}
                height={32}
                className="h-10 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link
                  href="/#services"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/book-now"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Now
                </Link>
                <Link
                  href="/about"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact-us"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
              <div className="py-6">
                <Link href="/book-now?type=quote" className="block">
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-semibold w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Quote
                  </Button>
                </Link>
                <Link href="/book-now" className="block mt-4">
                  <Button
                    variant="primary-linear"
                    size="lg"
                    className="font-semibold w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Book Now <span aria-hidden="true">&rarr;</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
