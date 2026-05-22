import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-gradient-to-br from-[#030712] via-[#071120] to-[#0b1524] text-white relative overflow-hidden">
      
      {/* Decorative Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e68932]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Left Column: Brand Statement */}
          <div className="space-y-5">
            <h2 className="text-3xl font-extrabold tracking-wider text-[#e68932]">
              ESHAARE TOUR
            </h2>
            <p className="text-gray-400 text-sm leading-7 max-w-sm">
              Providing premium visa consultation, bespoke holiday packages, and luxury travel support. Experience world-class journeys crafted with trust and expertise.
            </p>
          </div>

          {/* Middle Column: Quick Links with Transitions */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
              Quick Navigation
            </h3>
            <div className="flex flex-col gap-3 text-gray-400 text-sm">
              <Link 
                href="/" 
                className="flex items-center gap-1.5 hover:text-[#e68932] hover:translate-x-1.5 transition-all duration-300 w-fit"
              >
                <ArrowRight size={14} className="opacity-0 -ml-5 hover:opacity-100 transition-opacity" />
                <span>Home</span>
              </Link>
              <Link 
                href="/about" 
                className="flex items-center gap-1.5 hover:text-[#e68932] hover:translate-x-1.5 transition-all duration-300 w-fit"
              >
                <ArrowRight size={14} className="opacity-0 -ml-5 hover:opacity-100 transition-opacity" />
                <span>About Us</span>
              </Link>
              <Link 
                href="/packages" 
                className="flex items-center gap-1.5 hover:text-[#e68932] hover:translate-x-1.5 transition-all duration-300 w-fit"
              >
                <ArrowRight size={14} className="opacity-0 -ml-5 hover:opacity-100 transition-opacity" />
                <span>Holiday Packages</span>
              </Link>
              <Link 
                href="/visa" 
                className="flex items-center gap-1.5 hover:text-[#e68932] hover:translate-x-1.5 transition-all duration-300 w-fit"
              >
                <ArrowRight size={14} className="opacity-0 -ml-5 hover:opacity-100 transition-opacity" />
                <span>Visa Services</span>
              </Link>
              <Link 
                href="/contact" 
                className="flex items-center gap-1.5 hover:text-[#e68932] hover:translate-x-1.5 transition-all duration-300 w-fit"
              >
                <ArrowRight size={14} className="opacity-0 -ml-5 hover:opacity-100 transition-opacity" />
                <span>Contact Us</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Contact info */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              Contact Details
            </h3>
            <div className="flex flex-col gap-4 text-gray-400 text-sm">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#e68932] shrink-0" />
                <span>Dubai, United Arab Emirates</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#e68932] shrink-0" />
                <a href="tel:+971501234567" className="hover:text-white transition-colors">+971 50 123 4567</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#e68932] shrink-0" />
                <a href="mailto:info@eshaare.com" className="hover:text-white transition-colors">info@eshaare.com</a>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 mt-14 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 ESHAARE TOUR. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}