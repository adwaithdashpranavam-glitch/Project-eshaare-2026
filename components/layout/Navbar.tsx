"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X, MapPin, Phone, ChevronDown, ChevronRight } from "lucide-react";

const navData = [
  {
    title: "PRODUCTS",
    subcategories: [
      {
        title: "Visa Services",
        links: ["Schengen Visa", "UAE Visa", "UK Visa", "USA Visa", "Canada Visa", "Australia Visa", "Saudi Visa", "Travel Insurance", "Visa Consultation"]
      },
      {
        title: "Holiday Packages",
        links: ["Europe Tours", "Maldives Packages", "Thailand Packages", "Bali Packages", "Turkey Packages", "Georgia Packages", "Japan Packages", "Honeymoon Packages", "Luxury Tours"]
      },
      {
        title: "Flights",
        links: ["Flight Booking", "Business Class", "Multi-City Flights", "Airport Transfers"]
      },
      {
        title: "Hotels",
        links: ["Luxury Hotels", "Resorts", "Villas", "Family Resorts"]
      },
      {
        title: "Dubai Experiences",
        links: ["Desert Safari", "Burj Khalifa", "Yacht Rental", "Ferrari World", "Marina Cruise", "Abu Dhabi Tours"]
      }
    ]
  },
  {
    title: "LABELS",
    links: ["Home", "About Us", "Contact Us", "Why Choose Us", "Testimonials", "Partners", "Careers", "Gallery", "FAQ"]
  },
  {
    title: "NEWS",
    links: ["Visa Updates", "Travel News", "Destination Guides", "Travel Tips", "UAE Updates", "Schengen News", "Blog"]
  },
  {
    title: "OUR COMPANIES",
    links: ["ESHAARE Tourism", "ESHAARE Visa Services", "ESHAARE Holidays", "ESHAARE Corporate Travel", "ESHAARE Luxury Experiences", "Partner Network"]
  },
  {
    title: "ONLINE SERVICES",
    links: ["Appointment Booking", "WhatsApp Support", "Enquiry Form", "Live Chat", "Call Back Request", "Package Customization", "Flight Enquiry", "Hotel Enquiry", "Visa Consultation", "Start Your Journey"]
  }
];

const toSlug = (text: string) => {
  const t = text.trim();
  if (t === "Home") return "/";
  if (t === "About Us" || t === "Why Choose Us" || t === "Testimonials" || t === "Partners") return "/about";
  if (t === "Contact Us" || t === "Call Back Request" || t === "Live Chat") return "/contact";
  if (t === "Appointment Booking") return "/appointments";
  if (t === "Enquiry Form" || t === "Enquire Now" || t === "Start Your Journey" || t === "Package Customization" || t === "Flight Enquiry" || t === "Hotel Enquiry") return "/#inquiry";
  
  // Specific Visas
  if (t === "Schengen Visa") return "/visa/schengen";
  if (t === "UK Visa") return "/visa/uk";
  if (t === "USA Visa") return "/visa/usa";
  if (t === "Japan Visa") return "/visa/japan";

  // Visa Services
  if (t === "Visa Services" || t === "Visa Consultation" || t.endsWith("Visa")) return "/visa";
  
  // Specific Packages
  if (t === "Japan Packages") return "/packages/japan-tour";
  if (t === "Thailand Packages") return "/packages/thailand-tour";
  if (t === "Maldives Packages") return "/packages/maldives-tour";
  if (t === "Europe Tours") return "/packages/switzerland-tour";

  // Flights
  if (t.startsWith("Flight") || t === "Business Class" || t === "Multi-City Flights" || t === "Airport Transfers") return "/flights";
  
  // Hotels
  if (t.startsWith("Hotel") || t === "Luxury Hotels" || t === "Resorts" || t === "Villas" || t === "Family Resorts") return "/hotels";
  
  // Insurance
  if (t === "Travel Insurance") return "/insurance";

  // Dubai Experiences / Holidays / Tours
  if (t === "Holiday Packages" || t.endsWith("Packages") || t.endsWith("Tours") || t === "Dubai Experiences" || t === "Desert Safari" || t === "Burj Khalifa" || t === "Yacht Rental" || t === "Ferrari World" || t === "Marina Cruise" || t === "Abu Dhabi Tours") return "/tours";

  // WhatsApp Support
  if (t === "WhatsApp Support") return "https://wa.me/971501234567?text=Hi ESHAARE, I need travel assistance.";

  // News and blog subcategories map to /blog
  if (t === "Visa Updates" || t === "Travel News" || t === "Destination Guides" || t === "Travel Tips" || t === "UAE Updates" || t === "Schengen News" || t === "Blog") return "/blog";

  // Corporate subsidiaries map to /about
  if (t.startsWith("ESHAARE") || t === "Partner Network") return "/about";

  return `/${t.toLowerCase().replace(/ /g, '-')}`;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileSubExpanded, setMobileSubExpanded] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileNav = (title: string) => {
    if (mobileExpanded === title) {
      setMobileExpanded(null);
      setMobileSubExpanded(null);
    } else {
      setMobileExpanded(title);
      setMobileSubExpanded(null);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-100/95 backdrop-blur-md shadow-sm"
          : "bg-white/90 backdrop-blur-xl shadow-md border-b border-gray-100"
      }`}
    >
      <div className="max-w-[95rem] mx-auto px-4 xl:px-6 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 ml-8">
          {navData.map((navItem) => (
            <div key={navItem.title} className="relative group/main py-8">
              <button className="text-gray-800 group-hover/main:text-[#e68932] transition text-[13px] xl:text-sm font-semibold uppercase tracking-wide flex items-center gap-1">
                {navItem.title} <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-[70px] left-0 w-64 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover/main:opacity-100 group-hover/main:visible transition-all duration-300 py-2">
                {navItem.subcategories ? (
                  navItem.subcategories.map((sub) => (
                    <div key={sub.title} className="relative group/sub">
                      <div className="px-5 py-3 hover:bg-orange-50/50 hover:text-[#e68932] flex items-center justify-between text-sm font-medium text-gray-700 cursor-pointer transition-colors">
                        {sub.title} <ChevronRight className="w-4 h-4 text-gray-400 group-hover/sub:text-[#e68932]" />
                      </div>
                      
                      {/* Subcategory Dropdown */}
                      <div className="absolute top-0 left-full -ml-1 w-60 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 py-2">
                        {sub.links.map((link) => (
                          <Link key={link} href={toSlug(link)} className="block px-5 py-2.5 hover:bg-orange-50/50 hover:text-[#e68932] text-sm text-gray-600 transition-colors">
                            {link}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  navItem.links?.map((link) => (
                    <Link key={link} href={toSlug(link)} className="block px-5 py-2.5 hover:bg-orange-50/50 hover:text-[#e68932] text-sm font-medium text-gray-700 transition-colors">
                      {link}
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <Link href="/#inquiry" className="group relative flex items-center gap-2 h-11 bg-[#e68932] border border-[#e68932] text-white px-5 rounded-full font-semibold text-sm hover:bg-[#cf7726] transition-all duration-300 overflow-hidden shadow-md">
            <Phone className="h-4 w-4" />
            <span>Enquire Now</span>
          </Link>
          <Image
            src="/images/logo.png"
            alt="ESHAARE Logo"
            width={44}
            height={44}
            className="rounded-full object-cover h-11 w-11 shadow-sm border border-gray-200"
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-gray-700 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white max-h-[calc(100vh-80px)] overflow-y-auto shadow-xl">
          <div className="flex flex-col p-4">
            {navData.map((navItem) => (
              <div key={navItem.title} className="border-b border-gray-50 last:border-0">
                <button 
                  onClick={() => toggleMobileNav(navItem.title)}
                  className="w-full py-4 flex items-center justify-between text-sm font-bold text-gray-800"
                >
                  {navItem.title}
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === navItem.title ? 'rotate-180' : ''}`} />
                </button>
                
                {mobileExpanded === navItem.title && (
                  <div className="pb-3 pl-4">
                    {navItem.subcategories ? (
                      navItem.subcategories.map((sub) => (
                        <div key={sub.title} className="mt-1">
                          <button 
                            onClick={() => setMobileSubExpanded(mobileSubExpanded === sub.title ? null : sub.title)}
                            className="w-full py-2.5 flex items-center justify-between text-sm font-semibold text-gray-700"
                          >
                            {sub.title}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileSubExpanded === sub.title ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {mobileSubExpanded === sub.title && (
                            <div className="pl-4 py-1 flex flex-col gap-1 border-l-2 border-gray-100 ml-2">
                              {sub.links.map((link) => (
                                <Link key={link} href={toSlug(link)} onClick={() => setOpen(false)} className="py-2 text-[13px] text-gray-600">
                                  {link}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col gap-1">
                        {navItem.links?.map((link) => (
                          <Link key={link} href={toSlug(link)} onClick={() => setOpen(false)} className="py-2.5 text-[13px] font-medium text-gray-600">
                            {link}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/#inquiry" className="bg-[#e68932] text-white py-3 rounded-full text-center font-semibold text-sm shadow-md"
                onClick={() => setOpen(false)}>
                Enquire Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}