import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lentera Baca - Baca Novel Online Versi Premium",
    template: "%s | Lentera Baca"
  },
  description: "Platform baca novel online dengan antarmuka premium, modern, dan nyaman di mata (Soft Dark Mode). Terangi imajinasi Anda di Lentera Baca.",
  metadataBase: new URL("https://lentera-baca.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://lentera-baca.vercel.app",
    siteName: "Lentera Baca",
    title: "Lentera Baca - Baca Novel Online Versi Premium",
    description: "Nikmati pengalaman baca novel online terbaik dengan desain modern dan fitur premium.",
    images: "/og-image.png", // USER: You should add an og-image.png to your public folder
  },
  twitter: {
    card: "summary_large_image",
    title: "Lentera Baca - Baca Novel Online Versi Premium",
    description: "Platform baca novel online dengan antarmuka premium dan nyaman di mata.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "we9mD5OQZFEOt9ESLYdSrtXXh9LF-PkrZi23rlnJRx0",
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="id">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
