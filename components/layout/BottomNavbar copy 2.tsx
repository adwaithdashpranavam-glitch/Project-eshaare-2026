"use client";

import Link from "next/link";
import { Home, Map, CalendarDays, User } from "lucide-react";

const items = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Tours",
    href: "/tours",
    icon: Map,
  },
  {
    label: "Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    label: "Account",
    href: "/login",
    icon: User,
  },
];

export default function BottomNavbar() {
  return (
    <div className="fixed bottom-3 left-1/2 z-[9999] w-[920px] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-4 py-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-[2px] py-1 text-[10px] text-gray-600 transition hover:text-[#e68932]"
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}