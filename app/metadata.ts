import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Car Service Dallas | Luxury Chauffeur DFW | Noble Lane",
  description:
    "Noble Lane offers premium executive car service in Dallas-Fort Worth. AI-powered booking, luxury vehicles, professional chauffeurs, and real-time flight tracking for VIP clients.",
  keywords: [
    "executive car service Dallas",
    "luxury chauffeur DFW",
    "Dallas Fort Worth black car service",
    "private jet transportation",
    "VIP chauffeur service",
    "executive transportation Dallas",
    "luxury car service DFW airport",
    "professional chauffeur Dallas",
  ],
  authors: [{ name: "Noble Lane Executive Transportation" }],
  creator: "Noble Lane",
  publisher: "Noble Lane",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gonoblelane.com",
    title: "Executive Car Service Dallas | Luxury Chauffeur DFW | Noble Lane",
    description:
      "Noble Lane offers premium executive car service in Dallas-Fort Worth. AI-powered booking, luxury vehicles, professional chauffeurs, and real-time flight tracking for VIP clients.",
    siteName: "Noble Lane Executive Transportation",
    images: [
      {
        url: "/noble-lane-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Noble Lane Executive Car Service Dallas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Executive Car Service Dallas | Luxury Chauffeur DFW | Noble Lane",
    description:
      "Noble Lane offers premium executive car service in Dallas-Fort Worth. AI-powered booking, luxury vehicles, professional chauffeurs, and real-time flight tracking for VIP clients.",
    images: ["/noble-lane-og-image.jpg"],
  },
  verification: {
    google: "your-google-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code",
    },
  },
};
