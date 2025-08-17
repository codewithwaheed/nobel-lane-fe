import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Contact Noble Lane - Book Executive Car Service Dallas | Schedule Luxury Transportation",
  description:
    "Book executive car service Dallas with Noble Lane. Schedule luxury transportation Dallas, make Dallas car service reservations. Contact our executive transport team for premium transportation booking Dallas.",
  keywords: [
    "book executive car service Dallas",
    "schedule luxury transportation Dallas",
    "Dallas car service reservations",
    "executive transport contact Dallas",
    "premium transportation booking Dallas",
    "VIP car booking Dallas",
    "luxury chauffeur booking Dallas",
    "Dallas executive transport contact",
    "Noble Lane contact information",
    "Dallas luxury car service booking",
  ],
  openGraph: {
    title: "Contact Noble Lane - Book Executive Car Service Dallas",
    description:
      "Ready to experience premium executive transportation? Book executive car service Dallas and schedule luxury transportation with our professional team.",
    url: "https://gonoblelane.com/contact-us",
    images: [
      {
        url: "/contact-og.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Noble Lane Executive Transportation",
      },
    ],
    type: "website",
    siteName: "Noble Lane Executive Transportation",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Noble Lane - Book Executive Car Service Dallas",
    description:
      "Ready to experience premium executive transportation? Book executive car service Dallas and schedule luxury transportation.",
    images: ["/contact-og.jpg"],
  },
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
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
