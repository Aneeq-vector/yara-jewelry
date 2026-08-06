import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Yara - Crafted For Elegance",
  description:
    "Discover Yara's collection of premium imitation jewelry. Elegant earrings, necklaces, rings, bracelets & curated sets designed to elevate every moment.",
  keywords: [
    "imitation jewelry",
    "fashion jewelry",
    "premium jewelry",
    "earrings",
    "necklaces",
    "rings",
    "bracelets",
    "affordable luxury",
  ],
  openGraph: {
    title: "Yara - Crafted For Elegance",
    description: "Premium imitation jewelry designed to elevate every moment.",
    type: "website",
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
        {children}
      </body>
    </html>
  );
}
