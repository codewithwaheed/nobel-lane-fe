import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "DFW Airport Transportation | Black Car Service Dallas Airport | Noble Lane",
  description:
    "Professional DFW airport transportation and black car service Dallas airport. Flight monitoring, luxury vehicles, and reliable transfers to DFW International and Love Field.",
  keywords: [
    "DFW airport transportation",
    "black car service Dallas airport",
    "Dallas airport transfer service",
    "DFW airport car service",
    "airport transportation Dallas",
    "Love Field airport service",
    "DFW airport shuttle service",
    "Dallas airport chauffeur",
    "airport transfer Dallas Fort Worth",
    "DFW ground transportation",
  ],
  openGraph: {
    title: "DFW Airport Transportation | Black Car Service Dallas Airport",
    description:
      "Professional DFW airport transportation and black car service. Flight monitoring, luxury vehicles, and reliable airport transfers.",
    url: "https://gonoblelane.com/airport-transfers",
    images: [
      {
        url: "/airport-transfers-og.jpg",
        width: 1200,
        height: 630,
        alt: "DFW Airport Transportation - Noble Lane",
      },
    ],
  },
};

export default function AirportTransfersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
