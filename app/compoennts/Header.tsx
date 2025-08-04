// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Dialog, DialogPanel, PopoverGroup } from "@headlessui/react";
// import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
// import { Button } from "@/components/ui/button";
// import PhoneCall from "./PhoneCall";

// export default function Header({
//   setIsBookingModalOpen,
// }: {
//   setIsBookingModalOpen: (open: boolean) => void;
// }) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <header className="bg-white border-b border-gray-200 dark:border-gray-700">
//       <nav
//         aria-label="Global"
//         className="mx-auto flex max-w-7xl items-center justify-between p-6 pb-0 md:pb-6 lg:px-8"
//       >
//         <div className="flex lg:flex-1">
//           <Link href="/" className="-m-1.5 p-1.5">
//             <span className="sr-only"> Nobel Lane</span>
//             <Image
//               alt=""
//               src="/logo.png"
//               width={220}
//               height={90}
//               className="h-10 mb-2 md:mb-0 md:h-12 w-auto"
//             />
//           </Link>
//         </div>
//         <div className="flex lg:hidden">
//           <button
//             type="button"
//             onClick={() => setMobileMenuOpen(true)}
//             className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
//           >
//             <span className="sr-only">Open main menu</span>
//             <Bars3Icon aria-hidden="true" className="size-6" />
//           </button>
//         </div>
//         <PopoverGroup className="hidden lg:flex lg:gap-x-8">
//           <Link
//             href="/#services"
//             className="text-sm/6 font-semibold text-gray-900"
//           >
//             Services
//           </Link>
//           <Link
//             href="/book-now"
//             className="text-sm/6 font-semibold text-gray-900"
//           >
//             Book Now
//           </Link>
//           <Link href="/about" className="text-sm/6 font-semibold text-gray-900">
//             About
//           </Link>
//           <Link
//             href="/contact-us"
//             className="text-sm/6 font-semibold text-gray-900"
//           >
//             Contact
//           </Link>
//         </PopoverGroup>
//         <div className="hidden lg:flex lg:flex-1 lg:justify-end">
//           <PhoneCall />
//           <Link href="/book-now?type=quote">
//             <Button variant="outline" className="font-semibold">
//               Get Quote
//             </Button>
//           </Link>
//           <Link href="/book-now" className="ml-3">
//             <Button variant="primary-linear" className="font-semibold">
//               Book Now <span aria-hidden="true">&rarr;</span>
//             </Button>
//           </Link>
//         </div>
//       </nav>
//       <div className="lg:hidden">
//         <div className="flex items-center justify-between px-1 py-1">
//           <div className="flex-1">
//             <PhoneCall />
//           </div>
//           <Button
//             variant="primary-linear"
//             size="sm"
//             className="font-semibold flex-1 ml-2"
//             onClick={() => setIsBookingModalOpen(true)}
//           >
//             Book Now <span aria-hidden="true">&rarr;</span>
//           </Button>
//         </div>
//       </div>
//       <Dialog
//         open={mobileMenuOpen}
//         onClose={setMobileMenuOpen}
//         className="lg:hidden"
//       >
//         <div className="fixed inset-0 z-50" />
//         <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
//           <div className="flex items-center justify-between">
//             <Link href="/" className="-m-1.5 p-1.5">
//               <span className="sr-only">Noble Lane</span>
//               <Image
//                 alt=""
//                 src="/logo.png"
//                 width={32}
//                 height={32}
//                 className="h-10 w-auto"
//               />
//             </Link>
//             <button
//               type="button"
//               onClick={() => setMobileMenuOpen(false)}
//               className="-m-2.5 rounded-md p-2.5 text-gray-700"
//             >
//               <span className="sr-only">Close menu</span>
//               <XMarkIcon aria-hidden="true" className="size-6" />
//             </button>
//           </div>
//           <div className="mt-6 flow-root">
//             <div className="-my-6 divide-y divide-gray-500/10">
//               <div className="space-y-2 py-6">
//                 <Link
//                   href="/#services"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Services
//                 </Link>
//                 <Link
//                   href="/book-now"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Book Now
//                 </Link>
//                 <Link
//                   href="/about"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   About
//                 </Link>
//                 <Link
//                   href="/contact-us"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Contact
//                 </Link>
//               </div>
//               <div className="py-6">
//                 <Link href="/book-now?type=quote" className="block">
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     className="font-semibold w-full"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Get Quote
//                   </Button>
//                 </Link>
//                 <Link href="/book-now" className="block mt-4">
//                   <Button
//                     variant="primary-linear"
//                     size="lg"
//                     className="font-semibold w-full"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Book Now <span aria-hidden="true">&rarr;</span>
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </DialogPanel>
//       </Dialog>
//     </header>
//   );
// }







// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Dialog,
//   DialogPanel,
//   Popover,
//   PopoverButton,
//   PopoverGroup,
//   PopoverPanel,
// } from "@headlessui/react";
// import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
// import { Button } from "@/components/ui/button";
// import PhoneCall from "./PhoneCall";

// const services = [
//   { name: "Executive Transportation", href: "/executive-transportation" },
//   { name: "Airport Transfers", href: "/airport-transfers" },
//   { name: "Private Jet & FBO Coordination", href: "/private-jet-fbo" },
//   { name: "Corporate Car Service & Roadshows", href: "/corporate-car-service" },
//   { name: "Group Transportation", href: "/group-transportation" },
//   { name: "Medical Speaker Transport", href: "/medical-speaker-transport" },
// ];

// export default function Header({
//   setIsBookingModalOpen,
// }: {
//   setIsBookingModalOpen: (open: boolean) => void;
// }) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <header className="bg-white dark:bg-[#0b1727] border-b border-gray-200 dark:border-gray-700">
//       <nav
//         aria-label="Global"
//         className="mx-auto flex max-w-7xl items-center justify-between p-6 pb-0 md:pb-6 lg:px-8"
//       >
//         {/* Logo */}
//         <div className="flex lg:flex-1">
//           <Link href="/" className="-m-1.5 p-1.5">
//             <span className="sr-only"> Nobel Lane</span>
//             <Image
//               alt="Nobel Lane Logo"
//               src="/logo.png"
//               width={220}
//               height={90}
//               className="h-10 mb-2 md:mb-0 md:h-12 w-auto"
//             />
//           </Link>
//         </div>

//         {/* Mobile Menu Button */}
//         <div className="flex lg:hidden">
//           <button
//             type="button"
//             onClick={() => setMobileMenuOpen(true)}
//             className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
//           >
//             <span className="sr-only">Open main menu</span>
//             <Bars3Icon aria-hidden="true" className="size-6" />
//           </button>
//         </div>

//         {/* Desktop Menu */}
//         <PopoverGroup className="hidden lg:flex lg:gap-x-8 items-center">
//           <Popover className="relative">
//             <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//               Services
//               <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400 dark:text-gray-300" />
//             </PopoverButton>
//             <PopoverPanel
//               transition
//               className="absolute left-1/2 z-10 mt-3 w-56 -translate-x-1/2 overflow-hidden rounded-xl bg-white dark:bg-[#0b1727] shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 transition"
//             >
//               <div className="p-2 flex flex-col">
//                 {services.map((service) => (
//                   <Link
//                     key={service.name}
//                     href={service.href}
//                     className="rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
//                   >
//                     {service.name}
//                   </Link>
//                 ))}
//               </div>
//             </PopoverPanel>
//           </Popover>

//           <Link href="/book-now" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//             Book Now
//           </Link>
//           <Link href="/about" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//             About
//           </Link>
//           <Link href="/contact-us" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//             Contact
//           </Link>
//         </PopoverGroup>

//         {/* Desktop CTA */}
//         <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-2">
//           <PhoneCall />
//           <Link href="/book-now?type=quote">
//             <Button variant="outline" className="font-semibold">
//               Get Quote
//             </Button>
//           </Link>
//           <Link href="/book-now" className="ml-3">
//             <Button variant="primary-linear" className="font-semibold">
//               Book Now <span aria-hidden="true">&rarr;</span>
//             </Button>
//           </Link>
//         </div>
//       </nav>

//       {/* Mobile Menu */}
//       <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
//         <div className="fixed inset-0 z-50" />
//         <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-[#0b1727] p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700">
//           <div className="flex items-center justify-between">
//             <Link href="/" className="-m-1.5 p-1.5">
//               <span className="sr-only">Noble Lane</span>
//               <Image alt="Logo" src="/logo.png" width={32} height={32} className="h-10 w-auto" />
//             </Link>
//             <button
//               type="button"
//               onClick={() => setMobileMenuOpen(false)}
//               className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
//             >
//               <span className="sr-only">Close menu</span>
//               <XMarkIcon aria-hidden="true" className="size-6" />
//             </button>
//           </div>

//           <div className="mt-6 flow-root">
//             <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
//               <div className="space-y-2 py-6">
//                 {services.map((service) => (
//                   <Link
//                     key={service.name}
//                     href={service.href}
//                     className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     {service.name}
//                   </Link>
//                 ))}
//                 <Link
//                   href="/about"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   About
//                 </Link>
//                 <Link
//                   href="/contact-us"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Contact
//                 </Link>
//               </div>

//               <div className="py-6">
//                 <Link href="/book-now?type=quote" className="block">
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     className="font-semibold w-full"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Get Quote
//                   </Button>
//                 </Link>
//                 <Link href="/book-now" className="block mt-4">
//                   <Button
//                     variant="primary-linear"
//                     size="lg"
//                     className="font-semibold w-full"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Book Now <span aria-hidden="true">&rarr;</span>
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </DialogPanel>
//       </Dialog>
//     </header>
//   );
// }







// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Dialog,
//   DialogPanel,
//   Popover,
//   PopoverButton,
//   PopoverGroup,
//   PopoverPanel,
// } from "@headlessui/react";
// import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
// import { Button } from "@/components/ui/button";
// import PhoneCall from "./PhoneCall";

// const services = [
//   { name: "Executive Transportation", href: "/services/executive-transportation" },
//   { name: "Airport Transfers", href: "/services/airport-transfers" },
//   { name: "Private Jet & FBO Coordination", href: "/services/private-jet-fbo" },
//   { name: "Corporate Car Service & Roadshows", href: "/services/corporate-car-service" },
//   { name: "Group Transportation", href: "/services/group-transportation" },
//   { name: "Medical Speaker Transport", href: "/services/medical-speaker-transport" },
// ];

// export default function Header({
//   setIsBookingModalOpen,
// }: {
//   setIsBookingModalOpen: (open: boolean) => void;
// }) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <header className="bg-white dark:bg-[#0b1727] border-b border-gray-200 dark:border-gray-700">
//       <nav
//         aria-label="Global"
//         className="mx-auto flex max-w-7xl items-center justify-between p-6 pb-0 md:pb-6 lg:px-8"
//       >
//         {/* Logo */}
//         <div className="flex lg:flex-1">
//           <Link href="/" className="-m-1.5 p-1.5">
//             <span className="sr-only">Nobel Lane</span>
//             <Image
//               alt="Nobel Lane Logo"
//               src="/logo.png"
//               width={220}
//               height={90}
//               className="h-10 mb-2 md:mb-0 md:h-12 w-auto"
//             />
//           </Link>
//         </div>

//         {/* Mobile Menu Button */}
//         <div className="flex lg:hidden">
//           <button
//             type="button"
//             onClick={() => setMobileMenuOpen(true)}
//             className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
//           >
//             <span className="sr-only">Open main menu</span>
//             <Bars3Icon aria-hidden="true" className="size-6" />
//           </button>
//         </div>

//         {/* Desktop Menu */}
//         <PopoverGroup className="hidden lg:flex lg:gap-x-8 items-center">
//           {/* Services Dropdown */}
//           <Popover className="relative">
//             <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//               Services
//               <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400 dark:text-gray-300" />
//             </PopoverButton>
//             <PopoverPanel
//               transition
//               className="absolute left-1/2 z-10 mt-3 w-60 -translate-x-1/2 overflow-hidden rounded-xl bg-white dark:bg-[#0b1727] shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700"
//             >
//               <div className="p-2 flex flex-col">
//                 <Link
//                   href="/services"
//                   className="rounded-lg px-4 py-2 text-sm font-bold text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800"
//                 >
//                   View All Services →
//                 </Link>
//                 {services.map((service) => (
//                   <Link
//                     key={service.name}
//                     href={service.href}
//                     className="rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
//                   >
//                     {service.name}
//                   </Link>
//                 ))}
//               </div>
//             </PopoverPanel>
//           </Popover>

//           <Link href="/book-now" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//             Book Now
//           </Link>
//           <Link href="/about" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//             About
//           </Link>
//           <Link href="/contact-us" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//             Contact
//           </Link>
//         </PopoverGroup>

//         {/* Desktop CTA */}
//         <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-2">
//           <PhoneCall />
//           <Link href="/book-now?type=quote">
//             <Button variant="outline" className="font-semibold">
//               Get Quote
//             </Button>
//           </Link>
//           <Link href="/book-now" className="ml-3">
//             <Button variant="primary-linear" className="font-semibold">
//               Book Now <span aria-hidden="true">&rarr;</span>
//             </Button>
//           </Link>
//         </div>
//       </nav>

//       {/* Mobile Menu */}
//       <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
//         <div className="fixed inset-0 z-50" />
//         <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-[#0b1727] p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700">
//           <div className="flex items-center justify-between">
//             <Link href="/" className="-m-1.5 p-1.5">
//               <span className="sr-only">Noble Lane</span>
//               <Image alt="Logo" src="/logo.png" width={32} height={32} className="h-10 w-auto" />
//             </Link>
//             <button
//               type="button"
//               onClick={() => setMobileMenuOpen(false)}
//               className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
//             >
//               <span className="sr-only">Close menu</span>
//               <XMarkIcon aria-hidden="true" className="size-6" />
//             </button>
//           </div>

//           <div className="mt-6 flow-root">
//             <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
//               <div className="space-y-2 py-6">
//                 <Link
//                   href="/services"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-bold text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   View All Services →
//                 </Link>
//                 {services.map((service) => (
//                   <Link
//                     key={service.name}
//                     href={service.href}
//                     className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     {service.name}
//                   </Link>
//                 ))}

//                 <Link
//                   href="/book-now"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Book Now
//                 </Link>
//                 <Link
//                   href="/about"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   About
//                 </Link>
//                 <Link
//                   href="/contact-us"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Contact
//                 </Link>
//               </div>

//               <div className="py-6">
//                 <Link href="/book-now?type=quote" className="block">
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     className="font-semibold w-full"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Get Quote
//                   </Button>
//                 </Link>
//                 <Link href="/book-now" className="block mt-4">
//                   <Button
//                     variant="primary-linear"
//                     size="lg"
//                     className="font-semibold w-full"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Book Now <span aria-hidden="true">&rarr;</span>
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </DialogPanel>
//       </Dialog>
//     </header>
//   );
// }








// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Dialog,
//   DialogPanel,
//   Popover,
//   PopoverButton,
//   PopoverGroup,
//   PopoverPanel,
// } from "@headlessui/react";
// import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
// import { Button } from "@/components/ui/button";
// import PhoneCall from "./PhoneCall";

// const services = [
//     { name: "Services", href: "/#services" },
//   { name: "Executive Transportation", href: "/executive-transportation" },
//   { name: "Airport Transfers", href: "/airport-transfers" },
//   { name: "Private Jet & FBO Coordination", href: "/private-jet-fbo" },
//   { name: "Corporate Car Service & Roadshows", href: "/corporate-car-service" },
//   { name: "Group Transportation", href: "/group-transportation" },
//   { name: "Medical Speaker Transport", href: "/medical-speaker-transport" },
// ];

// export default function Header({
//   setIsBookingModalOpen,
// }: {
//   setIsBookingModalOpen: (open: boolean) => void;
// }) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <header className="bg-white dark:bg-[#0b1727] border-b border-gray-200 dark:border-gray-700">
//       <nav
//         aria-label="Global"
//         className="mx-auto flex max-w-7xl items-center justify-between p-6 pb-0 md:pb-6 lg:px-8"
//       >
//         {/* Logo */}
//         <div className="flex lg:flex-1">
//           <Link href="/" className="-m-1.5 p-1.5">
//             <span className="sr-only">Nobel Lane</span>
//             <Image
//               alt="Nobel Lane Logo"
//               src="/logo.png"
//               width={220}
//               height={90}
//               className="h-10 mb-2 md:mb-0 md:h-12 w-auto"
//             />
//           </Link>
//         </div>

//         {/* Mobile Menu Button */}
//         <div className="flex lg:hidden">
//           <button
//             type="button"
//             onClick={() => setMobileMenuOpen(true)}
//             className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
//           >
//             <span className="sr-only">Open main menu</span>
//             <Bars3Icon aria-hidden="true" className="size-6" />
//           </button>
//         </div>

//         {/* Desktop Menu */}
//         <PopoverGroup className="hidden lg:flex lg:gap-x-8 items-center">
//           {/* Services Dropdown */}
//           <Popover className="relative">
//             <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//               <Link href="/#services">Services</Link>
//               <ChevronDownIcon
//                 aria-hidden="true"
//                 className="size-5 flex-none text-gray-400 dark:text-gray-300"
//               />
//             </PopoverButton>
//             <PopoverPanel
//               transition
//               className="absolute left-1/2 z-10 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-xl bg-white dark:bg-[#0b1727] shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 transition"
//             >
//               <div className="p-2 flex flex-col">
//                 {services.map((service) => (
//                   <Link
//                     key={service.name}
//                     href={service.href}
//                     className="rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
//                   >
//                     {service.name}
//                   </Link>
//                 ))}
//               </div>
//             </PopoverPanel>
//           </Popover>

//           <Link href="/book-now" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//             Book Now
//           </Link>
//           <Link href="/about" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//             About
//           </Link>
//           <Link href="/contact-us" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//             Contact
//           </Link>
//         </PopoverGroup>

//         {/* Desktop CTA */}
//         <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-2">
//           <PhoneCall />
//           <Link href="/book-now?type=quote">
//             <Button variant="outline" className="font-semibold">
//               Get Quote
//             </Button>
//           </Link>
//           <Link href="/book-now" className="ml-3">
//             <Button variant="primary-linear" className="font-semibold">
//               Book Now <span aria-hidden="true">&rarr;</span>
//             </Button>
//           </Link>
//         </div>
//       </nav>

//       {/* Mobile Menu */}
//       <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
//         <div className="fixed inset-0 z-50" />
//         <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-[#0b1727] p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700">
//           <div className="flex items-center justify-between">
//             <Link href="/" className="-m-1.5 p-1.5">
//               <span className="sr-only">Noble Lane</span>
//               <Image alt="Logo" src="/logo.png" width={32} height={32} className="h-10 w-auto" />
//             </Link>
//             <button
//               type="button"
//               onClick={() => setMobileMenuOpen(false)}
//               className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
//             >
//               <span className="sr-only">Close menu</span>
//               <XMarkIcon aria-hidden="true" className="size-6" />
//             </button>
//           </div>

//           <div className="mt-6 flow-root">
//             <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
//               <div className="space-y-2 py-6">
//                 {/* Services Main Link */}
//                 <Link
//                   href="/#services"
//                     className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Services
//                 </Link>
//                 {services.map((service) => (
//                   <Link
//                     key={service.name}
//                     href={service.href}
//                     className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     {service.name}
//                   </Link>
//                 ))}

                // <Link
                //   href="/book-now"
                //   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                //   onClick={() => setMobileMenuOpen(false)}
                // >
                //   Book Now
                // </Link>
//                 <Link
//                   href="/about"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   About
//                 </Link>
//                 <Link
//                   href="/contact-us"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Contact
//                 </Link>
//               </div>

//               <div className="py-6">
//                 <Link href="/book-now?type=quote" className="block">
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     className="font-semibold w-full"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Get Quote
//                   </Button>
//                 </Link>
//                 <Link href="/book-now" className="block mt-4">
//                   <Button
//                     variant="primary-linear"
//                     size="lg"
//                     className="font-semibold w-full"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Book Now <span aria-hidden="true">&rarr;</span>
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </DialogPanel>
//       </Dialog>
//     </header>
//   );
// }




// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Dialog,
//   DialogPanel,
//   Popover,
//   PopoverButton,
//   PopoverGroup,
//   PopoverPanel,
//   Disclosure,
//   DisclosureButton,
//   DisclosurePanel,
// } from "@headlessui/react";
// import {
//   Bars3Icon,
//   XMarkIcon,
//   ChevronDownIcon,
// } from "@heroicons/react/24/outline";
// import { Button } from "@/components/ui/button";
// import PhoneCall from "./PhoneCall";

// const services = [
//   { name: "Executive Transportation", href: "/executive-transportation" },
//   { name: "Airport Transfers", href: "/airport-transfers" },
//   { name: "Private Jet & FBO Coordination", href: "/private-jet-fbo" },
//   { name: "Corporate Car Service & Roadshows", href: "/corporate-car-service" },
//   { name: "Group Transportation", href: "/group-transportation" },
//   { name: "Medical Speaker Transport", href: "/medical-speaker-transport" },
// ];

// export default function Header({
//   setIsBookingModalOpen,
// }: {
//   setIsBookingModalOpen: (open: boolean) => void;
// }) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <header className="bg-white dark:bg-[#0b1727] border-b border-gray-200 dark:border-gray-700">
//       <nav
//         aria-label="Global"
//         className="mx-auto flex max-w-7xl items-center justify-between p-6 pb-0 md:pb-6 lg:px-8"
//       >
//         {/* Logo */}
//         <div className="flex lg:flex-1">
//           <Link href="/" className="-m-1.5 p-1.5">
//             <span className="sr-only"> Nobel Lane</span>
//             <Image
//               alt="Nobel Lane Logo"
//               src="/logo.png"
//               width={220}
//               height={90}
//               className="h-10 mb-2 md:mb-0 md:h-12 w-auto"
//             />
//           </Link>
//         </div>

//         {/* Mobile Menu Button */}
//         <div className="flex lg:hidden">
//           <button
//             type="button"
//             onClick={() => setMobileMenuOpen(true)}
//             className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
//           >
//             <span className="sr-only">Open main menu</span>
//             <Bars3Icon aria-hidden="true" className="size-6" />
//           </button>
//         </div>

//         {/* Desktop Menu */}
//         <PopoverGroup className="hidden lg:flex lg:gap-x-8 items-center">
//           {/* Services Dropdown */}
//           <Popover className="relative">
//             <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//               <Link href="/#services">Services</Link>
//               <ChevronDownIcon
//                 aria-hidden="true"
//                 className="size-5 flex-none text-gray-400 dark:text-gray-300"
//               />
//             </PopoverButton>
//             <PopoverPanel
//               transition
//               className="absolute left-1/2 z-10 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-xl bg-white dark:bg-[#0b1727] shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 transition"
//             >
//               <div className="p-2 flex flex-col">
//                 {services.map((service) => (
//                   <Link
//                     key={service.name}
//                     href={service.href}
//                     className="rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
//                   >
//                     {service.name}
//                   </Link>
//                 ))}
//               </div>
//             </PopoverPanel>
//           </Popover>

//           <Link
//             href="/book-now"
//             className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500"
//           >
//             Book Now
//           </Link>
//           <Link
//             href="/about"
//             className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500"
//           >
//             About
//           </Link>
//           <Link
//             href="/contact-us"
//             className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500"
//           >
//             Contact
//           </Link>
//         </PopoverGroup>

//         {/* Desktop CTA */}
//         <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-2">
//           <PhoneCall />
//           <Link href="/book-now?type=quote">
//             <Button variant="outline" className="font-semibold">
//               Get Quote
//             </Button>
//           </Link>
//           <Link href="/book-now" className="ml-3">
//             <Button variant="primary-linear" className="font-semibold">
//               Book Now <span aria-hidden="true">&rarr;</span>
//             </Button>
//           </Link>
//         </div>
//       </nav>

//       {/* Mobile Menu */}
//       <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
//         <div className="fixed inset-0 z-50" />
//         <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-[#0b1727] p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700">
//           <div className="flex items-center justify-between">
//             <Link href="/" className="-m-1.5 p-1.5">
//               <span className="sr-only">Nobel Lane</span>
//               <Image alt="Logo" src="/logo.png" width={32} height={32} className="h-10 w-auto" />
//             </Link>
//             <button
//               type="button"
//               onClick={() => setMobileMenuOpen(false)}
//               className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
//             >
//               <span className="sr-only">Close menu</span>
//               <XMarkIcon aria-hidden="true" className="size-6" />
//             </button>
//           </div>

//           <div className="mt-6 flow-root">
//             <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
//               <div className="space-y-2 py-6">
//                 {/* Mobile Services Dropdown */}
//                 {/* <Disclosure as="div" className="-mx-3">
//                   <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
//                     <Link href="/#services">Services</Link>
//                     <ChevronDownIcon
//                       aria-hidden="true"
//                       className="size-5 flex-none group-data-open:rotate-180"
//                     />
//                   </DisclosureButton>
//                   <DisclosurePanel className="mt-2 space-y-2">
//                     {services.map((service) => (
//                       <Link
//                         key={service.name}
//                         href={service.href}
//                         className="block rounded-lg py-2 pr-3 pl-6 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                         onClick={() => setMobileMenuOpen(false)}
//                       >
//                         {service.name}
//                       </Link>
//                     ))}
//                   </DisclosurePanel>
//                 </Disclosure> */}

//                 {/* Mobile Services Dropdown */}
// <Disclosure as="div" className="-mx-3">
//   <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
//     Services
//     <ChevronDownIcon
//       aria-hidden="true"
//       className="size-5 flex-none group-data-open:rotate-180"
//     />
//   </DisclosureButton>
//   <DisclosurePanel className="mt-2 space-y-2">
//     {/* Services Home */}
//     <Link
//       href="/#services"
//       className="block rounded-lg py-2 pr-3 pl-6 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//       onClick={() => setMobileMenuOpen(false)}
//     >
//       Services Home
//     </Link>

//     {services.map((service) => (
//       <Link
//         key={service.name}
//         href={service.href}
//         className="block rounded-lg py-2 pr-3 pl-6 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//         onClick={() => setMobileMenuOpen(false)}
//       >
//         {service.name}
//       </Link>
//     ))}
//   </DisclosurePanel>
// </Disclosure>


//                 <Link
//                   href="/book-now"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Book Now
//                 </Link>
//                 <Link
//                   href="/about"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   About
//                 </Link>
//                 <Link
//                   href="/contact-us"
//                   className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Contact
//                 </Link>
//               </div>

//               <div className="py-6">
//                 <Link href="/book-now?type=quote" className="block">
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     className="font-semibold w-full"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Get Quote
//                   </Button>
//                 </Link>
//                 <Link href="/book-now" className="block mt-4">
//                   <Button
//                     variant="primary-linear"
//                     size="lg"
//                     className="font-semibold w-full"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Book Now <span aria-hidden="true">&rarr;</span>
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </DialogPanel>
//       </Dialog>
//     </header>
//   );
// }








// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Dialog,
//   DialogPanel,
//   Popover,
//   PopoverButton,
//   PopoverGroup,
//   PopoverPanel,
//   Disclosure,
//   DisclosureButton,
//   DisclosurePanel,
// } from "@headlessui/react";
// import {
//   Bars3Icon,
//   XMarkIcon,
//   ChevronDownIcon,
// } from "@heroicons/react/24/outline";
// import { Button } from "@/components/ui/button";
// import PhoneCall from "./PhoneCall";

// const services = [
//   { name: "Executive Transportation", href: "/executive-transportation" },
//   { name: "Airport Transfers", href: "/airport-transfers" },
//   { name: "Private Jet & FBO Coordination", href: "/private-jet-fbo" },
//   { name: "Corporate Car Service & Roadshows", href: "/corporate-car-service" },
//   { name: "Group Transportation", href: "/group-transportation" },
//   { name: "Medical Speaker Transport", href: "/medical-speaker-transport" },
// ];

// export default function Header({
//   setIsBookingModalOpen,
// }: {
//   setIsBookingModalOpen: (open: boolean) => void;
// }) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <>
//       {/* HEADER */}
//       <header className="bg-white dark:bg-[#0b1727] border-b border-gray-200 dark:border-gray-700 relative z-50">
//         <nav
//           aria-label="Global"
//           className="mx-auto flex max-w-7xl items-center justify-between p-6 pb-0 md:pb-6 lg:px-8"
//         >
//           {/* Logo */}
//           <div className="flex lg:flex-1">
//             <Link href="/" className="-m-1.5 p-1.5">
//               <span className="sr-only"> Nobel Lane</span>
//               <Image
//                 alt="Nobel Lane Logo"
//                 src="/logo.png"
//                 width={220}
//                 height={90}
//                 className="h-10 mb-2 md:mb-0 md:h-12 w-auto"
//               />
//             </Link>
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="flex lg:hidden">
//             <button
//               type="button"
//               onClick={() => setMobileMenuOpen(true)}
//               className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
//             >
//               <span className="sr-only">Open main menu</span>
//               <Bars3Icon aria-hidden="true" className="size-6" />
//             </button>
//           </div>

//           {/* Desktop Menu */}
//           <PopoverGroup className="hidden lg:flex lg:gap-x-8 items-center">
//             {/* Services Dropdown */}
//             <Popover className="relative">
//               <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
//                 <Link href="/#services">Services</Link>
//                 <ChevronDownIcon
//                   aria-hidden="true"
//                   className="size-5 flex-none text-gray-400 dark:text-gray-300"
//                 />
//               </PopoverButton>
//               <PopoverPanel
//                 transition
//                 className="absolute left-1/2 z-50 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-xl bg-white dark:bg-[#0b1727] shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 transition"
//               >
//                 <div className="p-2 flex flex-col">
//                   <Link
//                     href="/#services"
//                     className="rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
//                   >
//                     Services Home
//                   </Link>
//                   {services.map((service) => (
//                     <Link
//                       key={service.name}
//                       href={service.href}
//                       className="rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
//                     >
//                       {service.name}
//                     </Link>
//                   ))}
//                 </div>
//               </PopoverPanel>
//             </Popover>

//             <Link
//               href="/book-now"
//               className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500"
//             >
//               Book Now
//             </Link>
//             <Link
//               href="/about"
//               className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500"
//             >
//               About
//             </Link>
//             <Link
//               href="/contact-us"
//               className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500"
//             >
//               Contact
//             </Link>
//           </PopoverGroup>

//           {/* Desktop CTA */}
//           <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-2">
//             <PhoneCall />
//             <Link href="/book-now?type=quote">
//               <Button variant="outline" className="font-semibold">
//                 Get Quote
//               </Button>
//             </Link>
//             <Link href="/book-now" className="ml-3">
//               <Button variant="primary-linear" className="font-semibold">
//                 Book Now <span aria-hidden="true">&rarr;</span>
//               </Button>
//             </Link>
//           </div>
//         </nav>

//         {/* Mobile Menu */}
//         <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
//           <div className="fixed inset-0 z-40 bg-black/20" />
//           <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-[#0b1727] p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700">
//             <div className="flex items-center justify-between">
//               <Link href="/" className="-m-1.5 p-1.5">
//                 <span className="sr-only">Nobel Lane</span>
//                 <Image alt="Logo" src="/logo.png" width={32} height={32} className="h-10 w-auto" />
//               </Link>
//               <button
//                 type="button"
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
//               >
//                 <span className="sr-only">Close menu</span>
//                 <XMarkIcon aria-hidden="true" className="size-6" />
//               </button>
//             </div>

//             <div className="mt-6 flow-root">
//               <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
//                 <div className="space-y-2 py-6">
//                   {/* Mobile Services Dropdown */}
//                   <Disclosure as="div" className="-mx-3">
//                     <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
//                       Services
//                       <ChevronDownIcon
//                         aria-hidden="true"
//                         className="size-5 flex-none group-data-open:rotate-180"
//                       />
//                     </DisclosureButton>
//                     <DisclosurePanel className="mt-2 space-y-2">
//                       <Link
//                         href="/#services"
//                         className="block rounded-lg py-2 pr-3 pl-6 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                         onClick={() => setMobileMenuOpen(false)}
//                       >
//                         Services Home
//                       </Link>
//                       {services.map((service) => (
//                         <Link
//                           key={service.name}
//                           href={service.href}
//                           className="block rounded-lg py-2 pr-3 pl-6 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                           onClick={() => setMobileMenuOpen(false)}
//                         >
//                           {service.name}
//                         </Link>
//                       ))}
//                     </DisclosurePanel>
//                   </Disclosure>

//                   <Link
//                     href="/book-now"
//                     className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Book Now
//                   </Link>
//                   <Link
//                     href="/about"
//                     className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     About
//                   </Link>
//                   <Link
//                     href="/contact-us"
//                     className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Contact
//                   </Link>
//                 </div>

//                 <div className="py-6">
//                   <Link href="/book-now?type=quote" className="block">
//                     <Button
//                       variant="outline"
//                       size="lg"
//                       className="font-semibold w-full"
//                       onClick={() => setMobileMenuOpen(false)}
//                     >
//                       Get Quote
//                     </Button>
//                   </Link>
//                   <Link href="/book-now" className="block mt-4">
//                     <Button
//                       variant="primary-linear"
//                       size="lg"
//                       className="font-semibold w-full"
//                       onClick={() => setMobileMenuOpen(false)}
//                     >
//                       Book Now <span aria-hidden="true">&rarr;</span>
//                     </Button>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </DialogPanel>
//         </Dialog>
//       </header>

//       {/* HERO SECTION */}
//       {/* <section className="relative z-0">
//         <Image
//           src="/hero.jpg"
//           alt="Hero Image"
//           width={1920}
//           height={800}
//           className="w-full h-[500px] object-cover pointer-events-none"
//         />
//         {/* Hero content example */}
//         {/* <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
//           Welcome to Nobel Lane
//         </div>
//       </section> */}
//     </>
//   );
// }









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
import { Button } from "@/components/ui/button";
import PhoneCall from "./PhoneCall";

const services = [
  { name: "Executive Transportation", href: "/executive-transportation" },
  { name: "Airport Transfers", href: "/airport-transfers" },
  { name: "Private Jet & FBO Coordination", href: "/private-jet-fbo" },
  { name: "Corporate Car Service & Roadshows", href: "/corporate-car-service" },
  { name: "Group Transportation", href: "/group-transportation" },
  { name: "Medical Speaker Transport", href: "/medical-speaker-transport" },
];

export default function Header({
  setIsBookingModalOpen,
}: {
  setIsBookingModalOpen: (open: boolean) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* HEADER */}
      <header className="bg-white dark:bg-[#0b1727] border-b border-gray-200 dark:border-gray-700 relative z-50">
        <nav
          aria-label="Global"
          className="mx-auto flex max-w-7xl items-center justify-between p-6 pb-0 md:pb-6 lg:px-8"
        >
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only"> Nobel Lane</span>
              <Image
                alt="Nobel Lane Logo"
                src="/logo.png"
                width={220}
                height={90}
                className="h-10 mb-2 md:mb-0 md:h-12 w-auto"
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>

          {/* Desktop Menu */}
          <PopoverGroup className="hidden lg:flex lg:gap-x-8 items-center">
            {/* Services Dropdown */}
            <Popover className="relative">
              <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500">
                Services
                <ChevronDownIcon
                  aria-hidden="true"
                  className="size-5 flex-none text-gray-400 dark:text-gray-300"
                />
              </PopoverButton>
              <PopoverPanel
                transition
                className="absolute left-1/2 z-50 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-xl bg-white dark:bg-[#0b1727] shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 transition"
              >
                <div className="p-2 flex flex-col">
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </PopoverPanel>
            </Popover>

            <Link
              href="/book-now"
              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500"
            >
              Book Now
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500"
            >
              About
            </Link>
            <Link
              href="/contact-us"
              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-500"
            >
              Contact
            </Link>
          </PopoverGroup>

          {/* Desktop CTA */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-2">
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

        {/* Mobile Menu */}
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/20" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-[#0b1727] p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Nobel Lane</span>
                <Image alt="Logo" src="/logo.png" width={32} height={32} className="h-10 w-auto" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
                <div className="space-y-2 py-6">
                  {/* Mobile Services Dropdown */}
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                      Services
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="size-5 flex-none group-data-open:rotate-180"
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2">
                      {services.map((service) => (
                        <Link
                          key={service.name}
                          href={service.href}
                          className="block rounded-lg py-2 pr-3 pl-6 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {service.name}
                        </Link>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>

                  <Link
                    href="/book-now"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Book Now
                  </Link>
                  <Link
                    href="/about"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact-us"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
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
    </>
  );
}
