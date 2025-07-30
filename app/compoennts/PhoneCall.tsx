import { Smartphone } from "lucide-react";
import React from "react";

export default function PhoneCall() {
  return (
    <>
      <a
        href="tel:2145550100"
        className=" hidden md:block mr-4 border-x-1 border-gray-300 px-4 "
      >
        <div className="flex items-center flex-col text-sm">
          <span className="flex items-center">
            <Smartphone className="h-4 w-4 mr-1" />
            Reservations
          </span>
          <strong>(214) 555-0100</strong>
        </div>
      </a>
      <a
        href="tel:2145550100"
        className="md:hidden py-2 px-2 flex items-center border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50  cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
      >
        <div className="flex items-center text-xs">
          <Smartphone className="h-4 w-4 mr-1" />
          Reservations:
          <strong>(214) 555-0100</strong>
        </div>
      </a>
    </>
  );
}
