"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BookingWizard from "@/app/compoennts/BookingWizard";

function BookNowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type"); // "quote" or "book-now"
  const isQuote = type === "quote";

  const handleClose = () => {
    router.push("/");
  };

  return <BookingWizard isQuote={isQuote} onClose={handleClose} />;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your booking details...</p>
      </div>
    </div>
  );
}

export default function BookNowPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookNowContent />
    </Suspense>
  );
}
