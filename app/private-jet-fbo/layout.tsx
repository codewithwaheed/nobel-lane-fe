import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Private Jet Ground Transportation Dallas | FBO Car Service DFW | Noble Lane",
  description:
    "Premium private jet ground transportation Dallas. Professional FBO car service for private jet passengers at DFW, Addison, and Dallas Executive airports.",
  keywords: [
    "private jet ground transportation Dallas",
    "FBO car service DFW",
    "private jet transportation Dallas",
    "FBO ground transportation",
    "private aviation car service Dallas",
    "jet charter ground transportation",
    "FBO transfer service Dallas",
    "private jet chauffeur service",
    "aviation ground transportation DFW",
    "executive jet car service Dallas",
  ],
  openGraph: {
    title: "Private Jet Ground Transportation Dallas | FBO Car Service DFW",
    description:
      "Premium private jet ground transportation Dallas. Professional FBO car service for private jet passengers at DFW area airports.",
    url: "https://gonoblelane.com/private-jet-fbo",
    images: [
      {
        url: "/private-jet-og.jpg",
        width: 1200,
        height: 630,
        alt: "Private Jet Ground Transportation Dallas - Noble Lane",
      },
    ],
  },
};

export default function PrivateJetFBOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
