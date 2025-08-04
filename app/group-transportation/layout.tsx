import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Group Transportation Dallas Fort Worth | Corporate Event Transportation | Noble Lane",
  description:
    "Professional group transportation Dallas Fort Worth. Corporate event transportation, wedding shuttles, and large group coordination with luxury vehicles and experienced drivers.",
  keywords: [
    "group transportation Dallas Fort Worth",
    "corporate event transportation Dallas",
    "group shuttle service DFW",
    "wedding transportation Dallas",
    "event transportation Fort Worth",
    "group car service Dallas",
    "corporate group transportation",
    "large group transportation DFW",
    "event shuttle service Dallas",
    "group chauffeur service Dallas",
  ],
  openGraph: {
    title:
      "Group Transportation Dallas Fort Worth | Corporate Event Transportation",
    description:
      "Professional group transportation Dallas Fort Worth. Corporate event transportation, wedding shuttles, and large group coordination.",
    url: "https://noblelane.com/group-transportation",
    images: [
      {
        url: "/group-transportation-og.jpg",
        width: 1200,
        height: 630,
        alt: "Group Transportation Dallas Fort Worth - Noble Lane",
      },
    ],
  },
};

export default function GroupTransportationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
