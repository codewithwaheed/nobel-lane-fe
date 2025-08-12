import type { Metadata } from "next";
import { Poppins, Crimson_Text } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const poppins = Poppins({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

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
    url: "https://noblelane.com",
    title: "Executive Car Service Dallas | Luxury Chauffeur DFW | Noble Lane",
    description:
      "Noble Lane offers premium executive car service in Dallas-Fort Worth. AI-powered booking, luxury vehicles, professional chauffeurs, and real-time flight tracking for VIP clients.",
    siteName: "Noble Lane Executive Transportation",
    images: [
      {
        url: "/logo.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mapsApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY;
  const masked = mapsApiKey
    ? mapsApiKey.slice(0, 6) + "..." + mapsApiKey.slice(-4)
    : "(none)";
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `console.info('[Maps] Using key (masked): ${masked}');${
              !mapsApiKey
                ? "console.warn('[Maps] No API key found in env (expected NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY)');"
                : ""
            }`,
          }}
        />
        {mapsApiKey ? (
          <script
            async
            defer
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`}
          />
        ) : null}
      </head>
      <body
        className={`${poppins.variable} ${crimsonText.variable} antialiased font-sans overflow-x-hidden`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
