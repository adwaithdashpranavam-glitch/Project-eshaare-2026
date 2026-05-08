"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image"; // Import Next.js Image component
import { Menu, X, MapPin, User, Phone } from "lucide-react";
export default function Navbar() {
const [open, setOpen] = useState(false);
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 20);
  };

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);
  return (
 <header
  className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
    scrolled
      ? "bg-gray-100/30 backdrop-blur-none shadow-sm"
      : "bg-white/75 backdrop-blur-xl shadow-md border-b border-gray-100"
  }`}
>
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo Section -  */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <MapPin className="h-6 w-6 text-[#21201e]" />
            <div className="absolute -top-1 -right-2 w-2 h-2 bg-[#0c0c0b] rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-[#e68932]">ESHAARE</span>
              <span className="text-[#141312]">TOUR</span>
            </h1>
            <p className="text-[12px] tracking-wider text-gray-800 font-semibold -mt-1">
              TOURS & EVENTS
            </p>
          </div>
        </Link>
{/* 
        Desktop Navigation
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/"
            className="text-white/80 hover:text-[#D4AF37] transition text-sm font-medium uppercase tracking-wide"
          >
            Home
          </Link>
          <Link
            href="/tours"
            className="text-white/80 hover:text-[#D4AF37] transition text-sm font-medium uppercase tracking-wide"
          >
            Tours
          </Link>
          <Link
            href="/events"
            className="text-white/80 hover:text-[#D4AF37] transition text-sm font-medium uppercase tracking-wide"
          >
            Events
          </Link>
          <Link
            href="/about"
            className="text-white/80 hover:text-[#D4AF37] transition text-sm font-medium uppercase tracking-wide"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-white/80 hover:text-[#D4AF37] transition text-sm font-medium uppercase tracking-wide"
          >
            Contact
          </Link>
        </nav> */}

        {/* Desktop Buttons - Enquire Now & Log In */}
<div className="hidden md:flex items-center gap-3 translate-x-10">
  
  <button className="group relative flex items-center gap-2 h-12 bg-[#e68932] border border-[#e68932] text-white px-5 rounded-full font-semibold text-sm hover:bg-[#cf7726] transition-all duration-300 overflow-hidden shadow-md">
    <Phone className="h-4 w-4" />
    <span>Enquire Now</span>
  </button>

  <button className="flex items-center gap-2 h-12 bg-white text-black px-5 rounded-full font-semibold text-sm border border-gray-400 hover:bg-gray-200 hover:text-black hover:border-gray-600 transition-all duration-300">
    <User className="h-4 w-4" />
    <span>Log In</span>
  </button>

  <Image
    src="/images/logo.png"
    alt="ESHAARE Logo"
    width={48}
    height={48}
    className="rounded-full object-cover h-12 w-12 ml-8"
  />
</div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-500 p-2 rounded-full bg-white/5"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>


      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="flex flex-col p-6 gap-5">
            <Link href="/" className="text-gray-700" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/about" className="text-gray-700" onClick={() => setOpen(false)}>
              About
            </Link>
            <Link href="/contact" className="text-gray-700" onClick={() => setOpen(false)}>
              Contact
            </Link>
            <hr className="border-gray-100" />
            <Link href="/enquiry" className="bg-[#e68932]  text-white px-5 py-2 rounded-full text-center font-semibold"
              onClick={() => setOpen(false)}>
              Enquire Now
            </Link>
            <Link
              href="/login"
              className="bg-gray-900 text-white px-5 py-2 rounded-full text-center font-semibold"
              onClick={() => setOpen(false)}
            >
              Log In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}