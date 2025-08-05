"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import PhoneCall from "./PhoneCall";

// Plane icon component (for private jets)
const PlaneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

// Car icon component
const CarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
  </svg>
);

const services = [
  // {
  //   name: "Executive Transportation",
  //   href: "/executive-transportation",
  //   icon: CarIcon,
  //   description: "Premium executive car service",
  // },
  {
    name: "Private Jet & FBO Coordination",
    href: "/private-jet-fbo",
    icon: CarIcon,
    description: "Seamless private aviation transfers",
  },
  {
    name: "Corporate Car Service",
    href: "/corporate-car-service",
    icon: BuildingOffice2Icon,
    description: "Professional business transportation",
  },
  {
    name: "Airport Transfers",
    href: "/airport-transfers",
    icon: PlaneIcon,
    description: "Reliable airport transportation",
  },
  {
    name: "Group Transportation",
    href: "/group-transportation",
    icon: UserGroupIcon,
    description: "Large group and event transportation",
  },
  {
    name: "Speaker Transportation",
    href: "/speaker-transport",
    icon: PresentationChartBarIcon,
    description: "Professional speaker and conference transport",
  },
];

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
        <PopoverGroup className="hidden lg:flex lg:gap-x-8 items-center">
          <div className="relative group">
            <Popover className="relative">
              {() => (
                <>
                  <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 dark:text-white outline-none cursor-pointer">
                    Services
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="size-5 flex-none text-gray-400 dark:text-gray-300 transition-transform group-hover:rotate-180"
                    />
                  </PopoverButton>
                  <PopoverPanel
                    static
                    className="absolute left-0 z-50 mt-3 w-80 md:w-96 overflow-hidden rounded-xl bg-white dark:bg-[#0b1727] shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200"
                  >
                    <div className="p-3 flex flex-col">
                      {services.map((service) => {
                        const Icon = service.icon;
                        return (
                          <Link
                            key={service.name}
                            href={service.href}
                            className="group rounded-lg px-4 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-start gap-3"
                          >
                            <Icon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {service.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {service.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </PopoverPanel>
                </>
              )}
            </Popover>
          </div>
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
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                    Services
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="size-5 flex-none group-data-open:rotate-180"
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {services.map((service) => {
                      const Icon = service.icon;
                      return (
                        <Link
                          key={service.name}
                          href={service.href}
                          className="flex items-center gap-3 rounded-lg py-2 pr-3 pl-6 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <div className="flex flex-col">
                            <span>{service.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                              {service.description}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </DisclosurePanel>
                </Disclosure>
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
