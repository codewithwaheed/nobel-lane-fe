import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
const fleetData = [
  {
    id: 1,
    name: "Luxury Sedan",
    image: "/luxury-sedan.png",
    passengers: 4,
    bags: 2,
    description: "A comfortable luxury sedan for up to 4 passengers.",
  },
  {
    id: 2,
    name: "Luxury SUV",
    image: "/luxury-suv.png",
    passengers: 6,
    bags: 4,
    description: "A spacious SUV for up to 6 passengers.",
  },
  {
    id: 3,
    name: "Sprinter Van",
    image: "/sprinter-van.png",
    passengers: 12,
    bags: 8,
    description: "A large sprinter van for group travel.",
  },
  {
    id: 4,
    name: "Revised Car",
    image: "/revised-car.png",
    passengers: 4,
    bags: 2,
    description: "A revised car model for a comfortable ride.",
  },
  {
    id: 5,
    name: "Standard Sedan",
    image: "/standard-sedan.png",
    passengers: 4,
    bags: 2,
    description: "A standard sedan for everyday travel.",
  },
];
export function FleetSection() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleItemClick = (targetIndex: number) => {
    if (api) {
      api.scrollTo(targetIndex);
    }
  };

  return (
    <div className=" bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 py-12 my-10">
        <h1 className="text-2xl md:text-4xl text-center font-bold mb-3">
          The Noble Fleet
        </h1>
        <p className="text-gray-600 md:text-xl text-center mt-2 mb-8  md:max-w-3xl mx-auto font-crimson italic">
          A Full Line of Luxurious Vehicles
        </p>
        <Carousel
          setApi={setApi}
          className="w-full max-w-7xl mx-auto"
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-1">
            {fleetData.map((item, index) => {
              const isActive = index === current;
              return (
                <CarouselItem
                  key={`${item.id}-${index}`}
                  className="pl-1 basis-full md:basis-1/3 lg:basis-1/3"
                >
                  <div className="p-1">
                    {isActive ? (
                      // Active item with full details - normal size
                      <Card
                        className="bg-transparent transition-all duration-500 ease-in-out cursor-pointer shadow-none border-none"
                        onClick={() => handleItemClick(index)}
                      >
                        <CardContent className="flex flex-col items-center justify-center p-6">
                          <div className="w-full aspect-[3/2] relative mb-4 transition-all duration-500 ease-in-out">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover rounded-lg transition-all duration-500 ease-in-out"
                            />
                          </div>

                          <div className="flex justify-between items-center mb-0 md:mb-4 w-full">
                            <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-0 transition-all duration-300">
                              {item.name}
                            </h3>
                            <div className="hidden md:flex items-center justify-center gap-4 text-sm border-x-2 border-gray-300 px-4 w-[180px]">
                              <span className="flex flex-col items-center gap-1 w-1/2">
                                <span className="font-bold text-xl">
                                  {item.passengers}
                                </span>
                                <span className="font-crimson italic">
                                  Passengers
                                </span>
                              </span>
                              <span className="flex flex-col items-center gap-1 border-l-2 pl-4 border-gray-300 w-1/2">
                                <span className="font-bold text-xl">
                                  {item.bags}
                                </span>
                                <span className="font-crimson italic">
                                  Bags
                                </span>
                              </span>
                            </div>
                          </div>
                          <p className="text-sm md:text-base text-gray-600 text-center mb-3">
                            {item.description}
                          </p>
                          <div className="transition-all duration-500 ease-in-out">
                            <div className="flex md:hidden items-center justify-center gap-4 text-sm">
                              <span className="flex flex-col items-center gap-1">
                                <span className="font-bold text-xl">
                                  {item.passengers}
                                </span>
                                <span className="italic">Passengers</span>
                              </span>
                              <span className="border border-gray-300 h-12"></span>
                              <span className="flex flex-col items-center gap-1">
                                <span className="font-bold text-xl">
                                  {item.bags}
                                </span>
                                <span className="italic">Bags</span>
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="primary-linear"
                            className="mt-4 w-full"
                          >
                            Book now <span aria-hidden="true">&rarr;</span>
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      // Inactive item - smaller and reduced details
                      <div
                        className="transition-all duration-500 ease-in-out cursor-pointer hover:scale-105 scale-90 opacity-60 hover:opacity-80 "
                        onClick={() => handleItemClick(index)}
                      >
                        <Card className="transition-all duration-500 ease-in-out shadow-none bg-transparent border-none">
                          <CardContent className="flex flex-col items-center justify-center p-4">
                            <div className="w-full aspect-[3/2] scale-50 relative mb-2 transition-all duration-500 ease-in-out">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover rounded-lg transition-all duration-500 ease-in-out"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {fleetData.map((_, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                index === current
                  ? "bg-primary scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
