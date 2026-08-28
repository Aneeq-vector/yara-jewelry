import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import MotionProvider from "@/components/layout/MotionProvider";
import { QueryProvider } from "@/components/layout/QueryProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://yarasl.shop"),
  title: {
    default: "Yara Jewelry Sri Lanka | Elegant Jewelry & Gifts",
    template: "%s | Yara Jewelry",
  },
  description:
    "Shop elegant jewelry, necklaces, pendants and gift boxes from Yara Jewelry Sri Lanka. Discover timeless pieces with islandwide delivery.",
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
    title: "Yara Jewelry Sri Lanka | Elegant Jewelry & Gifts",
    description:
      "Shop elegant jewelry, necklaces, pendants and gift boxes from Yara Jewelry Sri Lanka. Discover timeless pieces with islandwide delivery.",
    type: "website",
    url: "https://yarasl.shop",
    siteName: "Yara Jewelry",
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
      <head>
        <link rel="preconnect" href="https://pb.yarasl.shop" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pb.yarasl.shop" />
      </head>
      <body className="min-h-full flex flex-col bg-ivory text-burgundy overflow-x-hidden">
        <QueryProvider>
          <MotionProvider>{children}</MotionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
