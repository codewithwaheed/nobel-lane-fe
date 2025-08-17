import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "About Noble Lane - Professional Chauffeur Service Dallas | Executive Transportation Company",
  description:
    "Learn about Noble Lane, Dallas transportation leaders providing professional chauffeur service and VIP car service Dallas. Meet our experienced chauffeur team Dallas with 60+ years combined experience.",
  keywords: [
    "professional chauffeur service Dallas",
    "executive transportation company Dallas",
    "Dallas transportation leaders",
    "VIP car service Dallas",
    "experienced chauffeur team Dallas",
    "luxury chauffeur Dallas",
    "AI-powered transportation Dallas",
    "premium executive transport Dallas",
    "Noble Lane transportation company",
    "Dallas Fort Worth chauffeur service",
  ],
  openGraph: {
    title: "About Noble Lane - Professional Chauffeur Service Dallas",
    description:
      "Dallas transportation leaders with 60+ years experience. Professional chauffeur service and VIP car service Dallas with AI-powered efficiency.",
    url: "https://gonoblelane.com/about",
    images: [
      {
        url: "/team-og.jpg",
        width: 1200,
        height: 630,
        alt: "Noble Lane Executive Transportation Team",
      },
    ],
    type: "website",
    siteName: "Noble Lane Executive Transportation",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Noble Lane - Professional Chauffeur Service Dallas",
    description:
      "Dallas transportation leaders with 60+ years experience. Professional chauffeur service and VIP car service Dallas.",
    images: ["/team-og.jpg"],
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

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
