import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import MotionProvider from "@/components/layout/MotionProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://yarasl.shop"),
  title: {
    default: "Yara Jewellery Sri Lanka | Elegant Jewellery & Gifts",
    template: "%s | Yara Jewellery",
  },
  description:
    "Shop elegant jewellery, necklaces, pendants and gift boxes from Yara Jewellery Sri Lanka. Discover timeless pieces with islandwide delivery.",
  keywords: [
    "imitation jewelry",
    "fashion jewelry",
    "premium jewelry",
    "earrings",
    "necklaces",
    "rings",
    "bracelets",
    "affordable luxury",
    "sri lanka",
    "gift boxes",
  ],
  openGraph: {
    title: "Yara Jewellery Sri Lanka | Elegant Jewellery & Gifts",
    description:
      "Shop elegant jewellery, necklaces, pendants and gift boxes from Yara Jewellery Sri Lanka. Discover timeless pieces with islandwide delivery.",
    type: "website",
    url: "https://yarasl.shop",
    siteName: "Yara Jewellery",
    locale: "en_LK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col bg-ivory text-burgundy overflow-x-hidden">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
