"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BookingWizard from "@/app/compoennts/BookingWizard";
import LoadingFallback from "../compoennts/LoadingFallback";

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

export default function BookNowPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookNowContent />
    </Suspense>
  );
}
