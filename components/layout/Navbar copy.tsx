"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {

  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b border-white/10 bg-[#071120]/70 backdrop-blur-xl sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <Link href="/">
          <h1 className="text-2xl font-bold text-[#D4AF37] cursor-pointer">
            ESHAARE
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">

          <Link
            href="/"
            className="hover:text-[#D4AF37] transition"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="hover:text-[#D4AF37] transition"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="hover:text-[#D4AF37] transition"
          >
            Contact
          </Link>

        </nav>

        <button className="hidden md:block bg-[#D4AF37] text-black px-5 py-2 rounded-2xl font-semibold hover:bg-yellow-500 transition">
          WhatsApp
        </button>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>

      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#071120]">

          <div className="flex flex-col p-6 gap-5">

            <Link href="/">Home</Link>

            <Link href="/about">About</Link>

            <Link href="/contact">Contact</Link>

          </div>

        </div>
      )}

    </header>
  );
}