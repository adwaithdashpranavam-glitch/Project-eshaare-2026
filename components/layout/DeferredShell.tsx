"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

const BottomNavbar = dynamic(() => import("@/components/layout/BottomNavbar"), { ssr: false });
const GlobalFloatingCTA = dynamic(() => import("@/components/layout/GlobalFloatingCTA"), { ssr: false });

export default function DeferredShell() {
  useEffect(() => {
    // 15 days session auto-logout after inactivity check
    const checkSession = async () => {
      const { auth } = await import("@/lib/firebase");
      const { onAuthStateChanged, signOut } = await import("firebase/auth");
      
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const lastActiveStr = localStorage.getItem("lastActive");
          const now = Date.now();
          const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
          
          if (lastActiveStr) {
            const lastActive = parseInt(lastActiveStr, 10);
            if (now - lastActive > fifteenDaysMs) {
              console.warn("Session expired due to 15 days of inactivity. Logging out.");
              await signOut(auth);
              localStorage.removeItem("lastActive");
              window.location.href = "/login?expired=true";
              return;
            }
          }
          // Set/refresh active timestamp
          localStorage.setItem("lastActive", now.toString());
        } else {
          localStorage.removeItem("lastActive");
        }
      });
    };
    
    checkSession();

    // Event listener to record user activity and extend active session
    const updateActivity = () => {
      const lastActiveStr = localStorage.getItem("lastActive");
      if (lastActiveStr) {
        localStorage.setItem("lastActive", Date.now().toString());
      }
    };

    window.addEventListener("mousedown", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("touchstart", updateActivity);

    return () => {
      window.removeEventListener("mousedown", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
    };
  }, []);

  return (
    <>
      <BottomNavbar />
      <GlobalFloatingCTA />
    </>
  );
}
