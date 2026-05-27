"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Home,
  Globe,
  Search,
  CalendarDays,
  User,
  X,
} from "lucide-react";

export default function BottomNavbar() {
  const [openSearch, setOpenSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  return (
    <>
      {/* SEARCH POPUP */}
      {openSearch && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl px-6">
            <div className="flex h-14 items-center overflow-hidden rounded-full bg-white shadow-2xl">
              <input
                type="text"
                placeholder="Search destinations, tours, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 text-lg text-black outline-none"
              />

              <button className="mr-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#e68932] text-white">
                <Search size={21} />
              </button>
            </div>

            <button
              onClick={() => setOpenSearch(false)}
              className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAVBAR */}
      <div className="fixed bottom-5 left-1/2 z-[9999] w-[95%] max-w-4xl -translate-x-1/2 rounded-full border border-white/10 bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">

        <div className="grid grid-cols-5 items-center py-2">

          {/* GLOBE */}
          <button
            onClick={() => router.push("/globe")}
            className="flex flex-col items-center justify-center gap-1 text-xs text-gray-700 transition hover:text-[#e68932]"
          >
            <Globe size={20} />
            <span>Globe</span>
          </button>

          {/* HOME */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 text-xs text-gray-700 transition hover:text-[#e68932]"
          >
            <Home size={20} />
            <span>Home</span>
          </Link>

          {/* SEARCH */}
          <button
            onClick={() => setOpenSearch(true)}
            className="-mt-10 mx-auto flex h-16 w-16 flex-col items-center justify-center rounded-full bg-[#e68932] text-white shadow-[0_10px_30px_rgba(230,137,50,0.45)] transition hover:scale-105"
          >
            <Search size={23} />
            <span className="mt-1 text-[10px] font-medium">Search</span>
          </button>

          {/* EVENTS */}
          <Link
            href="/tours"
            prefetch={false}
            className="flex flex-col items-center justify-center gap-1 text-xs text-gray-700 transition hover:text-[#e68932]"
          >
            <CalendarDays size={20} />
            <span>Events</span>
          </Link>

          {/* ACCOUNT */}
          <Link
            href="/login"
            prefetch={false}
            className="flex flex-col items-center justify-center gap-1 text-xs text-gray-700 transition hover:text-[#e68932]"
          >
            <User size={20} />
            <span>Account</span>
          </Link>

        </div>
      </div>
    </>
  );
}