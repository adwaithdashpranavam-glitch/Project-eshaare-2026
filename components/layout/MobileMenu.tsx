"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">

      <button
        onClick={() => setOpen(!open)}
        className="text-white"
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {open && (
        <div className="absolute top-20 left-0 w-full bg-[#071120] border-t border-white/10 shadow-2xl">

          <div className="flex flex-col p-6 gap-6 text-white">

            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>

            <Link href="/about" onClick={() => setOpen(false)}>
              About
            </Link>

            <Link href="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>

            <button className="bg-[#D4AF37] text-black py-3 rounded-xl font-semibold">
              WhatsApp
            </button>

          </div>

        </div>
      )}

    </div>
  );
}