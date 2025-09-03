"use client";

import React, { Fragment } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialItem {
  photo: string;
  name: string;
  rating: number;
  content: string;
}

interface RatingProps {
  rating: number;
  showLabel?: boolean;
  className?: string;
}

const testimonialList: TestimonialItem[][] = [
  [
    {
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      name: "Dr. Thomas Dewar, Fort Worth, TX.",
      rating: 5,
      content:
        '"DFW was closing, and every Metroplex freeway was a sheet of ice, yet Charles stood ready at the gate. That single rescue transformed a long record of great service into lasting trust."',
    },
    {
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      name: "Sushil Ahuja, Deals Partner PwC",
      rating: 5,
      content:
        '"Over the years, Mike has become more of a dear friend to me, someone who me and my family trust deeply. If you\'re looking for a top-tier executive car service that prioritizes quality, professionalism, and reliability, this team is the gold standard."',
    },
  ],
];

const Rating: React.FC<RatingProps & React.HTMLAttributes<HTMLDivElement>> = ({
  rating,
  showLabel,
  className,
  ...rest
}) => (
  <div className={cn("flex items-center gap-1", className)} {...rest}>
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        const index = i + 1;
        let content: React.ReactNode = "";
        if (index <= Math.floor(rating))
          content = <Star className="w-6 h-6 text-yellow-500 fill-current" />;
        else if (rating > i && rating < index + 1)
          content = (
            <div className="relative">
              <Star className="w-6 h-6 text-yellow-200" />
              <Star
                className="w-6 h-6 text-yellow-500 fill-current absolute top-0 left-0"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            </div>
          );
        else if (index > rating)
          content = (
            <Star className="w-6 h-6 text-yellow-200 dark:text-opacity-20" />
          );

        return <Fragment key={i}>{content}</Fragment>;
      })}
    </div>
    {showLabel && <span className="ml-2 text-sm">{rating.toFixed(1)}</span>}
  </div>
);

interface TestimonialItemProps {
  item: TestimonialItem;
}

const TestimonialItemComponent: React.FC<TestimonialItemProps> = ({ item }) => {
  const { rating, content, name } = item;
  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl hover:-translate-y-1 h-full duration-300 p-6">
      <div className="mt-4">
        <div className="flex justify-between flex-wrap md:flex-nowrap items-center mb-6">
          <div className="flex items-center">
            {/* <div className="mr-3 flex-shrink-0">
              <Image
                src={photo}
                alt={name}
                className="rounded-full border-2 border-gray-200 object-cover"
                width={50}
                height={50}
              />
            </div> */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                {name}
              </h5>
            </div>
          </div>
          <Rating className="mt-2 md:mt-0" rating={rating} showLabel={false} />
        </div>
        <p className="leading-[1.8] opacity-80 mb-6">{content}</p>
      </div>
    </div>
  );
};

const ReviewsSection: React.FC = () => {
  return (
    <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white">
      <div className="container px-4 mx-auto relative">
        <div className="flex justify-center text-center mb-6 lg:mb-12">
          <div className="max-w-lg">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
              What Our Clients Say
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              Discover why executives and professionals choose our premium
              transportation service for their important journeys.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-12">
          {testimonialList[0].map((item, i) => (
            <div className="col-span-2 md:col-span-1" key={i}>
              <TestimonialItemComponent item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
