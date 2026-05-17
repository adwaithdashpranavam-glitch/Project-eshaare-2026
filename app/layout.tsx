import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNavbar from "@/components/layout/BottomNavbar";
import "./globals.css";

// IMPORT NAVBAR
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eshaare Tour",
  description: "Tours & Events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f5f5f5]">

        {/* TOP NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="flex-1">
          {children}
        </main>

        {/* GLOBAL BOTTOM NAVBAR */}
        <BottomNavbar />

      </body>
    </html>

  );
}