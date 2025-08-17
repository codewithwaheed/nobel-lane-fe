import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Corporate Car Service Dallas Fort Worth | Executive Business Transportation | Noble Lane",
  description:
    "Premium corporate car service Dallas Fort Worth. Executive business transportation for meetings, events, and VIP clients. Professional chauffeurs and luxury vehicles.",
  keywords: [
    "corporate car service Dallas Fort Worth",
    "executive business transportation Dallas",
    "corporate transportation DFW",
    "business car service Dallas",
    "executive car service Fort Worth",
    "corporate chauffeur service Dallas",
    "VIP business transportation",
    "executive meeting transportation",
    "corporate event transportation Dallas",
    "business travel car service DFW",
  ],
  openGraph: {
    title:
      "Corporate Car Service Dallas Fort Worth | Executive Business Transportation",
    description:
      "Premium corporate car service Dallas Fort Worth. Executive business transportation for meetings, events, and VIP clients.",
    url: "https://gonoblelane.com/corporate-car-service",
    images: [
      {
        url: "/corporate-car-og.jpg",
        width: 1200,
        height: 630,
        alt: "Corporate Car Service Dallas Fort Worth - Noble Lane",
      },
    ],
  },
};

export default function CorporateCarServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
