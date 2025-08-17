import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Medical Speaker Car Service Dallas | Healthcare Professional Transportation | Noble Lane",
  description:
    "Professional medical speaker car service Dallas. Specialized transportation for healthcare professionals, pharmaceutical executives, and medical conference speakers in DFW area.",
  keywords: [
    "medical speaker car service Dallas",
    "healthcare professional transportation Dallas",
    "pharmaceutical executive car service",
    "medical conference transportation DFW",
    "hospital transfer service Dallas",
    "medical speaker transport Fort Worth",
    "healthcare transportation Dallas",
    "medical event car service",
    "pharmaceutical conference transportation",
    "medical facility transportation Dallas",
  ],
  openGraph: {
    title:
      "Medical Speaker Car Service Dallas | Healthcare Professional Transportation",
    description:
      "Professional medical speaker car service Dallas. Specialized transportation for healthcare professionals, pharmaceutical executives, and medical conference speakers.",
    url: "https://gonoblelane.com/speaker-transport",
    images: [
      {
        url: "/medical-speaker-og.jpg",
        width: 1200,
        height: 630,
        alt: "Medical Speaker Car Service Dallas - Noble Lane",
      },
    ],
  },
};

export default function MedicalSpeakerTransportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
