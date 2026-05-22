"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import BottomNavbar from "./BottomNavbar";
import GlobalFloatingCTA from "./GlobalFloatingCTA";

export default function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <BottomNavbar />
      <GlobalFloatingCTA />
    </>
  );
}
